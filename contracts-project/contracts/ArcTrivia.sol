// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * Arc Trivia 1.0 — Combined game registry + Soulbound NFT contract.
 * - Players pay 2 USDC (native Arc token) to unlock the game.
 * - Each wallet can play exactly once.
 * - After completing the quiz, players mint a non-transferable SBT
 *   whose tier is determined by their score (backend-signed authorization).
 */
contract ArcTrivia is ERC721, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Tier IDs matching score ranges
    uint8 public constant TIER_WANDERER    = 0; // 0–2
    uint8 public constant TIER_SCOUT       = 1; // 3–5
    uint8 public constant TIER_EXPLORER    = 2; // 6–10
    uint8 public constant TIER_PATHFINDER  = 3; // 11–15
    uint8 public constant TIER_TRAILBLAZER = 4; // 16–19
    uint8 public constant TIER_LEGEND      = 5; // 20

    uint256 public constant ENTRY_FEE = 2 ether; // 2 USDC (native, 18 decimals)

    address public backendSigner;

    uint256 private _nextTokenId;

    struct PlayerRecord {
        bool hasPaid;
        bool hasMinted;
        uint8 score;
        uint8 tier;
        uint256 tokenId;
    }

    mapping(address => PlayerRecord) public players;
    mapping(uint256 => uint8) public tokenTier;
    mapping(uint256 => string) private _tokenURIs;

    // Tier counts for leaderboard
    mapping(uint8 => uint256) public tierCount;

    // Tier metadata URIs set by owner
    mapping(uint8 => string) public tierBaseURI;

    event GameEntered(address indexed player);
    event SBTMinted(address indexed player, uint256 tokenId, uint8 tier, uint8 score);

    constructor(address _backendSigner) ERC721("Arc Trivia SBT", "ARCT") Ownable(msg.sender) {
        backendSigner = _backendSigner;
    }

    // ─── Game Entry ───────────────────────────────────────────────

    function enterGame() external payable {
        require(msg.value == ENTRY_FEE, "Pay exactly 2 USDC");
        require(!players[msg.sender].hasPaid, "Already entered");
        players[msg.sender].hasPaid = true;
        emit GameEntered(msg.sender);
    }

    // ─── SBT Minting ─────────────────────────────────────────────

    /**
     * Mint SBT after game completion.
     * Backend signs: keccak256(abi.encodePacked(player, score, tier))
     * Player submits the signature to claim their NFT.
     */
    function mintSBT(uint8 score, uint8 tier, bytes calldata signature) external {
        require(players[msg.sender].hasPaid, "Must pay entry fee first");
        require(!players[msg.sender].hasMinted, "Already minted");
        require(tier <= TIER_LEGEND, "Invalid tier");

        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, score, tier));
        bytes32 ethHash = messageHash.toEthSignedMessageHash();
        address recovered = ethHash.recover(signature);
        require(recovered == backendSigner, "Invalid signature");

        uint256 tokenId = _nextTokenId++;
        players[msg.sender].hasMinted = true;
        players[msg.sender].score = score;
        players[msg.sender].tier = tier;
        players[msg.sender].tokenId = tokenId;

        tokenTier[tokenId] = tier;
        tierCount[tier]++;

        _mint(msg.sender, tokenId);
        emit SBTMinted(msg.sender, tokenId, tier, score);
    }

    // ─── Soulbound: block all transfers ──────────────────────────

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)) but block transfers and burns
        require(from == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }

    // ─── Token URI ────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tierBaseURI[tokenTier[tokenId]];
    }

    function setTierURI(uint8 tier, string calldata uri) external onlyOwner {
        tierBaseURI[tier] = uri;
    }

    // ─── Admin ────────────────────────────────────────────────────

    function setBackendSigner(address _signer) external onlyOwner {
        backendSigner = _signer;
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    function getTierCounts() external view returns (uint256[6] memory counts) {
        for (uint8 i = 0; i <= 5; i++) {
            counts[i] = tierCount[i];
        }
    }

    function hasPlayed(address player) external view returns (bool) {
        return players[player].hasPaid;
    }

    function hasMinted(address player) external view returns (bool) {
        return players[player].hasMinted;
    }
}
