import { useEffect, useState } from "react";

import { PoolManager, PoolManager__factory } from "../generated";
import { useProviderOrSigner } from "./useProviderOrSigner";

const POOL_MANAGER_ADDRESS = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

interface PoolInfo {
  index: number;
  stakingToken: string;
  poolAddress: string;
  weight: number;
  nextPeriod: number;
}

export const usePoolManager = (): {
  poolManager: PoolManager;
  poolAddresses: readonly string[];
  poolInfo: Record<string, PoolInfo>;
  operator: string | null;
  owner: string | null;
} => {
  const provider = useProviderOrSigner();
  const [thePoolManager, setPoolManager] = useState<PoolManager>(
    PoolManager__factory.connect(POOL_MANAGER_ADDRESS, provider)
  );
  const [poolAddresses, setPoolAddresses] = useState<readonly string[]>([]);
  const [operator, setOperator] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<Record<string, PoolInfo>>({});

  useEffect(() => {
    const poolManager = PoolManager__factory.connect(
      POOL_MANAGER_ADDRESS,
      provider
    );
    void (async () => {
      const count = await poolManager.poolsCount();
      const inputs = await Promise.all(
        Array(count.toNumber())
          .fill(null)
          .map((_, i) => poolManager.poolsByIndex(i))
      );
      setPoolAddresses(inputs);

      const pools = await Promise.all(
        inputs.map((input) => poolManager.pools(input))
      );

      const poolInfo: Record<string, PoolInfo> = {};
      pools.forEach(
        (p) =>
          (poolInfo[p.poolAddress] = {
            index: p.index.toNumber(),
            stakingToken: p.stakingToken,
            poolAddress: p.poolAddress,
            weight: p.weight.toNumber(),
            nextPeriod: p.nextPeriod.toNumber(),
          })
      );
      setPoolInfo(poolInfo);

      setOperator(await poolManager.operator());
      setOwner(await poolManager.owner());
      setPoolManager(thePoolManager);
    })();
  }, [thePoolManager, provider]);
  return {
    poolManager: thePoolManager,
    poolAddresses,
    poolInfo,
    operator,
    owner,
  };
};
