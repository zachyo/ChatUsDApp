export const formatPrices = (content: string) => {
  const parts = content.split("|");
  const priceData = {
    btcUsd: parts[1],
    btcUsdDecimals: parseInt(parts[2]),
    ethUsd: parts[3],
    ethUsdDecimals: parseInt(parts[4]),
    btcEth: parts[5],
    btcEthDecimals: parseInt(parts[6]),
    timestamp: parseInt(parts[7]),
  };
  console.log(priceData);
  return (
    <div className="space-y-1">
      <div className="font-bold text-blue-500">CRYPTO PRICE UPDATE</div>
      <div>
        BTC/USD:{" "}
        <span className="font-semibold">
          $
          {(
            Number(priceData.btcUsd) / Math.pow(10, priceData.btcUsdDecimals)
          ).toLocaleString()}
        </span>
      </div>
      <div>
        ETH/USD:{" "}
        <span className="font-semibold">
          $
          {(
            Number(priceData.ethUsd) / Math.pow(10, priceData.ethUsdDecimals)
          ).toLocaleString()}
        </span>
      </div>
      <div>
        BTC/ETH:{" "}
        <span className="font-semibold">
          {(
            Number(priceData.btcEth) / Math.pow(10, priceData.btcEthDecimals)
          ).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
