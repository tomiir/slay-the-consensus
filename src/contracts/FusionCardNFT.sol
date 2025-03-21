// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FusionCardNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct CardMetadata {
        string name;
        string networkOrigin;
        string[] parentCards;
        uint256 mintedAt;
        string cardType;
        string rarity;
        uint256 energy;
    }

    mapping(uint256 => CardMetadata) public cardMetadata;
    mapping(address => uint256[]) public cardsOwnedBy;
    address public gameServerAddress;

    event CardMinted(uint256 tokenId, address owner, string name);
    event CardFused(uint256 newTokenId, uint256[] parentTokenIds);

    constructor() ERC721("FusionCardNFT", "FUSION") Ownable(msg.sender) {}

    // Only owner can set the game server address (for future admin functions)
    function setGameServerAddress(address _address) external onlyOwner {
        gameServerAddress = _address;
    }

    // Anyone can mint their own starter cards
    function mintCard(
        address player,
        string memory name,
        string memory description,
        string memory networkOrigin,
        string memory cardType,
        string memory rarity,
        uint256 energy,
        string memory tokenURI
    ) external returns (uint256) {
        // Player must be msg.sender or the game server
        require(player == msg.sender || msg.sender == gameServerAddress, "Can only mint for yourself");
        
        uint256 tokenId = _nextTokenId++;

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        string[] memory emptyParents = new string[](0);
        
        cardMetadata[tokenId] = CardMetadata({
            name: name,
            networkOrigin: networkOrigin,
            parentCards: emptyParents,
            mintedAt: block.timestamp,
            cardType: cardType,
            rarity: rarity,
            energy: energy
        });

        cardsOwnedBy[player].push(tokenId);

        emit CardMinted(tokenId, player, name);
        return tokenId;
    }

    // Anyone can fuse their own cards
    function fuseCards(
        uint256[] memory parentTokenIds,
        string memory name,
        string memory tokenURI
    ) external returns (uint256) {
        require(parentTokenIds.length == 2, "Must provide exactly 2 parent cards");

        // Verify ownership of parent cards - only enforced for non-game-server
        if (msg.sender != gameServerAddress) {
            for (uint256 i = 0; i < parentTokenIds.length; i++) {
                require(_exists(parentTokenIds[i]), "Parent card does not exist");
                require(ownerOf(parentTokenIds[i]) == msg.sender, "You must own the parent cards");
            }
        }

        uint256 tokenId = _nextTokenId++;

        // Create parent card IDs array for metadata
        string[] memory parentCardIds = new string[](parentTokenIds.length);
        for (uint256 i = 0; i < parentTokenIds.length; i++) {
            parentCardIds[i] = string(abi.encodePacked(parentTokenIds[i]));
        }

        // Calculate new card properties based on parent cards
        CardMetadata memory parent1 = cardMetadata[parentTokenIds[0]];
        CardMetadata memory parent2 = cardMetadata[parentTokenIds[1]];

        // Determine new rarity (highest of parents)
        string memory newRarity = parent1.rarity;
        if (keccak256(bytes(parent2.rarity)) > keccak256(bytes(parent1.rarity))) {
            newRarity = parent2.rarity;
        }

        // Calculate new energy (average of parents, rounded up)
        uint256 newEnergy = (parent1.energy + parent2.energy + 1) / 2;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        cardMetadata[tokenId] = CardMetadata({
            name: name,
            networkOrigin: "fusion",
            parentCards: parentCardIds,
            mintedAt: block.timestamp,
            cardType: parent1.cardType, // Inherit card type from first parent
            rarity: newRarity,
            energy: newEnergy
        });

        cardsOwnedBy[msg.sender].push(tokenId);

        emit CardFused(tokenId, parentTokenIds);
        return tokenId;
    }

    function getCardMetadata(uint256 tokenId) external view returns (CardMetadata memory) {
        require(_exists(tokenId), "Card does not exist");
        return cardMetadata[tokenId];
    }

    function getCardsOwnedBy(address player) external view returns (uint256[] memory) {
        return cardsOwnedBy[player];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
} 