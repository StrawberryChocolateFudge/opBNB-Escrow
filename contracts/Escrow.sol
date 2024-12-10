//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
struct Detail {
    address payable buyer;
    address payable seller;
    uint256 pay;
    State state;
    bool initialized;
    bool withdrawn;
    address ERC20; // If address is zero address then it's not erc20, else it is.
}

enum State {
    awaiting_payment,
    awaiting_delivery,
    delivered,
    refunded
}

interface ISimpleTerms {
    function acceptedTerms(address _address) external view returns (bool);
}

contract Escrow is ReentrancyGuard {
    using SafeMath for uint256;
    using Address for address payable;
    using SafeERC20 for IERC20;

    ISimpleTerms simpleTerms;

    address payable private feeDAO;
    address payable private agent;
    bool private deprecated = false;
    uint256 private constant DAOFEE = 50; // 0.5 percent fee goes to the FEEDAO
    uint256 public FEE = 200; // if fee is 200, it's a 2 percent fee on all for the agent
    uint256 private constant FEEBASE = 10000; // Fee base is used for calculating the fee

    uint256 public totalProcessed;
    uint256 public currentBalance;

    mapping(address => uint256) public totalERC20Processed;
    mapping(address => uint256) public currentERC20Balance;

    mapping(uint256 => Detail) private details;
    uint256 private detailIndex;

    mapping(address => uint256[]) private myDetails;

    event EscrowCreated(uint256 detailIndex);
    event PaymentDeposited(uint256 to, uint256 amount, address isERC20);
    event DeliveryConfirmed(uint256 detail);
    event RefundConfirmed(uint256 detail);
    event Withdraw(
        uint256 detail,
        uint256 amount,
        uint256 agentFee,
        uint256 daoFee
    );
    event Refund(
        uint256 detail,
        uint256 amount,
        uint256 agentFee,
        uint256 daoFee
    );

    constructor(address _agent, address _simpleTerms, uint256 agentFee) {
        agent = payable(_agent);
        simpleTerms = ISimpleTerms(_simpleTerms);
        feeDAO = payable(0x050e8C2DC9454cA53dA9eFDAD6A93bB00C216Ca0);
        FEE = agentFee;
    }

    modifier checkAcceptance() {
        bool accepted = simpleTerms.acceptedTerms(msg.sender);
        require(accepted, "You must accept the terms first");
        _;
    }

    function createEscrow(
        address buyer,
        address seller,
        address _ERC20
    ) external checkAcceptance {
        require(buyer != seller, "Invalid addresses");
        require(buyer != address(0), "Invalid address");
        require(seller != address(0), "Invalid adress");
        require(deprecated == false, "Contract deprecated!");
        Detail memory detail = Detail({
            buyer: payable(buyer),
            seller: payable(seller),
            pay: 0,
            state: State.awaiting_payment,
            initialized: true,
            withdrawn: false,
            ERC20: _ERC20
        });

        if (_ERC20 != address(0)) {
            //Try to call totalSupply to check if it's a contract address with erc20 funcitons
            IERC20(_ERC20).totalSupply();
        }

        detailIndex++;
        details[detailIndex] = detail;
        myDetails[buyer].push(detailIndex);
        myDetails[seller].push(detailIndex);
        emit EscrowCreated(detailIndex);
    }

    function calculateFee(
        uint256 amount
    ) public view returns (uint256, uint256, uint256) {
        uint256 agentFee = (amount.mul(FEE)).div(FEEBASE);
        uint256 daoFee = (amount.mul(DAOFEE)).div(FEEBASE);
        uint256 result = amount.sub(agentFee);
        result = result.sub(daoFee);
        return (result, agentFee, daoFee);
    }

    function getDetails(uint256 at) external view returns (Detail memory) {
        return details[at];
    }

    function depositPay(uint256 detail) external payable checkAcceptance {
        require(details[detail].initialized, "The Escrow doesn't exist");
        require(
            details[detail].state == State.awaiting_payment,
            "Invalid Escrow State"
        );
        require(msg.sender == details[detail].buyer, "Only Buyer");
        require(details[detail].ERC20 == address(0), "Gas tokens only");
        details[detail].pay = msg.value;
        totalProcessed += msg.value;
        currentBalance += msg.value;
        details[detail].state = State.awaiting_delivery;
        emit PaymentDeposited(detail, msg.value, address(0));
    }

    function depositErc20Pay(
        uint256 detail,
        uint256 amount
    ) external checkAcceptance {
        require(details[detail].initialized, "The Escrow doesn't exist");
        require(
            details[detail].state == State.awaiting_payment,
            "Invalid Escrow State"
        );
        require(msg.sender == details[detail].buyer, "Only Buyer");
        address _ERC20 = details[detail].ERC20;

        require(_ERC20 != address(0), "Must be valid Erc20 address");

        bool success = IERC20(_ERC20).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        require(success, "Unable to transfer tokens");

        details[detail].pay = amount;
        totalERC20Processed[_ERC20] += amount;
        currentERC20Balance[_ERC20] += amount;
        details[detail].state = State.awaiting_delivery;

        emit PaymentDeposited(detail, amount, _ERC20);
    }

    function confirmDelivery(uint256 detail) external checkAcceptance {
        require(details[detail].initialized, "The escrow doesn't exist");
        require(
            details[detail].state == State.awaiting_delivery,
            "Invalid Escrow State"
        );
        require(
            details[detail].buyer == msg.sender || msg.sender == agent,
            "Invalid address"
        );

        details[detail].state = State.delivered;
        emit DeliveryConfirmed(detail);
    }

    function confirmRefund(uint256 detail) external checkAcceptance {
        require(details[detail].initialized, "The escrow doesn't exist");
        require(
            details[detail].state == State.awaiting_delivery,
            "Invalid Escrow State"
        );
        require(
            details[detail].seller == msg.sender || msg.sender == agent,
            "Invalid address"
        );
        details[detail].state = State.refunded;
        emit RefundConfirmed(detail);
    }

    function withdrawPay(uint256 detail) external nonReentrant checkAcceptance {
        require(details[detail].initialized, "The escrow doesn't exist");
        require(
            details[detail].state == State.delivered,
            "Invalid Escrow State"
        );
        require(
            details[detail].seller == msg.sender,
            "Only seller can withdraw"
        );
        require(!details[detail].withdrawn, "Already withdrawn");
        (uint256 pay, uint256 agentFee, uint256 daoFee) = calculateFee(
            details[detail].pay
        );
        details[detail].withdrawn = true;
        _processWithdraw(detail, pay, agentFee, daoFee, details[detail].seller);

        emit Withdraw(detail, pay, agentFee, daoFee);
    }

    function _processWithdraw(
        uint256 detail,
        uint256 pay,
        uint256 agentFee,
        uint256 daoFee,
        address payTo
    ) internal {
        if (details[detail].ERC20 != address(0)) {
            currentERC20Balance[details[detail].ERC20] -= details[detail].pay;
            address token = details[detail].ERC20;
            IERC20(token).transfer(payTo, pay);
            IERC20(token).transfer(agent, agentFee);
            IERC20(token).transfer(feeDAO, daoFee);
        } else {
            currentBalance -= details[detail].pay;
            payable(payTo).sendValue(pay);
            agent.sendValue(agentFee);
            feeDAO.sendValue(daoFee);
        }
    }

    function refund(uint256 detail) external nonReentrant checkAcceptance {
        require(details[detail].initialized, "The Escrow doesn't exist");
        require(
            details[detail].state == State.refunded,
            "Invalid Escrow State"
        );
        require(details[detail].buyer == msg.sender, "Only buyer can withdraw");
        require(!details[detail].withdrawn, "Already withdrawn");
        (uint256 pay, uint256 agentFee, uint256 daoFee) = calculateFee(
            details[detail].pay
        );
        details[detail].withdrawn = true;

        _processWithdraw(detail, pay, agentFee, daoFee, details[detail].buyer);

        emit Refund(detail, pay, agentFee, daoFee);
    }

    function getLastDetailIndex() external view returns (uint256) {
        return detailIndex;
    }

    function getDetailByIndex(
        uint256 index
    ) external view returns (Detail memory) {
        return details[index];
    }

    function getMyDetails(address my) external view returns (uint256[] memory) {
        return myDetails[my];
    }

    function getDetailsPaginated(
        uint256 first,
        uint256 second,
        uint256 third,
        uint256 fourth,
        uint256 fifth
    )
        external
        view
        returns (
            Detail memory,
            Detail memory,
            Detail memory,
            Detail memory,
            Detail memory
        )
    {
        return (
            details[first],
            details[second],
            details[third],
            details[fourth],
            details[fifth]
        );
    }

    function getArbiter() external view returns (address) {
        return agent;
    }

    function deprecateEscrow() external {
        require(msg.sender == agent, "Only the agent can call this.");
        deprecated = true;
    }

    function isDeprecated() external view returns (bool) {
        return deprecated;
    }
}
