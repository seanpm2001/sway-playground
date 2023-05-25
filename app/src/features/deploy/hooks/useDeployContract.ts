import { ContractFactory, JsonAbi } from 'fuels';
import { useMutation } from '@tanstack/react-query';
import { DeployState } from '../../../utils/types';
import { displayError } from '../../../utils/error';
import { useWallet } from '../../toolbar/hooks/useWallet';

export function useDeployContract(
  abi: string,
  bytecode: string,
  setContractId: (contractId: string) => void,
  setDeployState: (state: DeployState) => void
) {
  const { wallet } = useWallet();

  const mutation = useMutation(
    async () => {
      if (!wallet) {
        throw new Error('Cannot deploy without wallet');
      }

      const contractFactory = new ContractFactory(
        bytecode,
        JSON.parse(abi) as JsonAbi,
        wallet
      );

      const contract = await contractFactory.deployContract({
        storageSlots: [],
      });

      return contract.id.toB256();
    },
    {
      onSuccess: (data) => {
        handleSuccess(data);
      },
      onError: handleError,
    }
  );

  function handleError(error: any) {
    setDeployState(DeployState.NOT_DEPLOYED);
    displayError(error);
  }

  function handleSuccess(data: any) {
    setDeployState(DeployState.DEPLOYED);
    setContractId(data);
  }

  return mutation;
}
