import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

import { useMultisigContract } from "../../../../hooks/useMultisigContract";
import { useGetConnectedSigner } from "../../../../hooks/useProviderOrSigner";
import { TransactionBuilder } from "../../../common/TransactionBuilder";

interface Props {
  address: string;
}

export const MultisigAddTransaction: React.FC<Props> = ({
  address: multisigAddress,
}: Props) => {
  const multisig = useMultisigContract(multisigAddress);
  const getConnectedSigner = useGetConnectedSigner();

  const [txCount, setTxCount] = useState<number>(0);

  useEffect(() => {
    void (async () => {
      const theTxCount = await multisig.getTransactionCount(true, true);
      setTxCount(theTxCount.toNumber());
    })();
  }, [multisig]);

  return (
    <Wrapper>
      <h1>Multisig {multisig.address}</h1>
      <p>{txCount} transactions</p>
      <div>
        <h2>Add transaction</h2>
        <TransactionBuilder
          onSubmit={async ({ call, data }) => {
            const signer = await getConnectedSigner();
            const tx = await multisig
              .connect(signer)
              .submitTransaction(call.target, call.value, data);
            console.log("Submit TX", tx);
          }}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  max-width: 100%;
  width: 720px;
  margin: 0 auto;
`;