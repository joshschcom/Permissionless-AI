// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./PriceOracle.sol";
import "./PErc20.sol";

contract MockOracle is PriceOracle {
    mapping(address => uint) prices;
    event PricePosted(
        address asset,
        uint previousPriceMantissa,
        uint requestedPriceMantissa,
        uint newPriceMantissa
    );

    function _getUnderlyingAddress(
        PToken pToken
    ) private view returns (address) {
        address asset;
        if (compareStrings(pToken.symbol(), "pETH")) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = address(PErc20(address(pToken)).underlying());
        }
        return asset;
    }

    function getUnderlyingPrice(
        PToken pToken
    ) public view override returns (uint) {
        return prices[_getUnderlyingAddress(pToken)];
    }

    function setUnderlyingPrice(
        PToken pToken,
        uint underlyingPriceMantissa
    ) public {
        address asset = _getUnderlyingAddress(pToken);
        emit PricePosted(
            asset,
            prices[asset],
            underlyingPriceMantissa,
            underlyingPriceMantissa
        );
        prices[asset] = underlyingPriceMantissa;
    }

    function setDirectPrice(address asset, uint price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint) {
        return prices[asset];
    }

    function compareStrings(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }
}
