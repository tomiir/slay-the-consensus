// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FusionCardNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct CardMetadata {
        string name;
        string networkOrigin;
        string[] parentCards;
        uint256 mintedAt;
        string cardType; // "attack", "skill", "power"
        string rarity; // "common", "uncommon", "rare"
        uint256 energy;
    }
    
    mapping(uint256 => CardMetadata) public cardMetadata;
    uint256 private _tokenIds;
    address public gameServerAddress;
    
    event CardMinted(
        uint256 indexed tokenId, 
        address indexed owner, 
        string name,
        string networkOrigin,
        string cardType,
        string rarity
    );
    
    event CardFused(
        uint256 indexed newTokenId,
        uint256[] parentTokenIds,
        address indexed owner
    );
    
    constructor() ERC721("CryptoSpireFusion", "CSF") Ownable(msg.sender) {}
    
    modifier onlyGameServer() {
        require(msg.sender == gameServerAddress, "Not authorized: only game server can call this function");
        _;
    }
    
    function setGameServerAddress(address _address) external onlyOwner {
        gameServerAddress = _address;
        emit GameServerUpdated(_address);
    }
    
    function mintCard(
        address player,
        string memory name,
        string memory networkOrigin,
        string[] memory parentCards,
        string memory cardType,
        string memory rarity,
        uint256 energy,
        string memory tokenURI
    ) external onlyGameServer returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(player, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        cardMetadata[newTokenId] = CardMetadata({
            name: name,
            networkOrigin: networkOrigin,
            parentCards: parentCards,
            mintedAt: block.timestamp,
            cardType: cardType,
            rarity: rarity,
            energy: energy
        });
        
        emit CardMinted(newTokenId, player, name, networkOrigin, cardType, rarity);
        return newTokenId;
    }

    function fuseCards(
        uint256[] memory tokenIds,
        string memory newName,
        string memory newTokenURI
    ) external returns (uint256) {
        require(tokenIds.length == 2, "Must fuse exactly 2 cards");
        
        // Check ownership of both cards
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "Must own all cards to fuse");
        }
        
        // Create parent cards array for the new card
        string[] memory parentCards = new string[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            parentCards[i] = cardMetadata[tokenIds[i]].name;
        }
        
        // Burn the parent cards
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _burn(tokenIds[i]);
        }
        
        // Mint new fused card
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, newTokenURI);
        
        // Calculate new card properties
        string memory networkOrigin = "fusion";
        string memory rarity = determineNewRarity(tokenIds);
        uint256 energy = calculateNewEnergy(tokenIds);
        
        cardMetadata[newTokenId] = CardMetadata({
            name: newName,
            networkOrigin: networkOrigin,
            parentCards: parentCards,
            mintedAt: block.timestamp,
            cardType: cardMetadata[tokenIds[0]].cardType, // Inherit from first parent
            rarity: rarity,
            energy: energy
        });
        
        emit CardFused(newTokenId, tokenIds, msg.sender);
        return newTokenId;
    }
    
    function determineNewRarity(uint256[] memory tokenIds) internal view returns (string memory) {
        // Simple rarity upgrade logic
        bool allSameRarity = true;
        string memory firstRarity = cardMetadata[tokenIds[0]].rarity;
        
        for (uint256 i = 1; i < tokenIds.length; i++) {
            if (keccak256(bytes(cardMetadata[tokenIds[i]].rarity)) != keccak256(bytes(firstRarity))) {
                allSameRarity = false;
                break;
            }
        }
        
        if (allSameRarity) {
            if (keccak256(bytes(firstRarity)) == keccak256(bytes("common"))) {
                return "uncommon";
            } else if (keccak256(bytes(firstRarity)) == keccak256(bytes("uncommon"))) {
                return "rare";
            }
        }
        
        return firstRarity; // Default to keeping the same rarity
    }
    
    function calculateNewEnergy(uint256[] memory tokenIds) internal view returns (uint256) {
        // Simple energy calculation: average of parents + 1
        uint256 totalEnergy = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            totalEnergy += cardMetadata[tokenIds[i]].energy;
        }
        return (totalEnergy / tokenIds.length) + 1;
    }
    
    // View functions
    function getCardMetadata(uint256 tokenId) external view returns (CardMetadata memory) {
        require(_exists(tokenId), "Card does not exist");
        return cardMetadata[tokenId];
    }
    
    function getCardsOwnedBy(address player) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(player);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_exists(i) && ownerOf(i) == player) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    event GameServerUpdated(address indexed newGameServer);
} 