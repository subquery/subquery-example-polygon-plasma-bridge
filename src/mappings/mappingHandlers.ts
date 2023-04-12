import { Deposit, User, Withdrawl } from "../types";
import { TokenWithdrawnLog } from "../types/abi-interfaces/PlasmaAbi";
import { TokenDepositedLog } from "../types/abi-interfaces/PlasmaAbi";

async function checkGetUser(user: string): Promise<User> {
  let userRecord = await User.get(user.toLowerCase());
  if (!userRecord) {
    userRecord = User.create({
      id: user.toLowerCase(),
      totalDeposits: BigInt(0),
      totalWithdrawls: BigInt(0),
    });
  }
  return userRecord;
}

export async function handleDeposit(deposit: TokenDepositedLog): Promise<void> {
  logger.info(`New deposit transaction log at block ${deposit.blockNumber}`);
  const userId = deposit.args[2].toLowerCase();

  const userRecord = await checkGetUser(userId);

  const depositRecord = Deposit.create({
    id: `${deposit.transactionHash}-${deposit.logIndex}`,
    rootToken: deposit.args[0],
    childToken: deposit.args[1],
    userId,
    amount: deposit.args[3].toBigInt(),
    amountFriendly: deposit.args[3].toBigInt(),
    depositCount: deposit.args[4].toBigInt(),
  });
  await depositRecord.save();

  userRecord.totalDeposits += depositRecord.amount;
  await userRecord.save();
}

export async function handleWithdrawl(
  withdrawl: TokenWithdrawnLog
): Promise<void> {
  logger.info(
    `New Withdrawl transaction log at block ${withdrawl.blockNumber}`
  );
  const userId = withdrawl.args[2].toLowerCase();

  const userRecord = await checkGetUser(userId);

  const withdrawlRecord = Withdrawl.create({
    id: `${withdrawl.transactionHash}-${withdrawl.logIndex}`,
    rootToken: withdrawl.args[0],
    childToken: withdrawl.args[1],
    userId,
    amount: withdrawl.args[3].toBigInt(),
    amountFriendly: withdrawl.args[3].toBigInt(),
    withdrawlCount: withdrawl.args[4].toBigInt(),
  });
  await withdrawlRecord.save();

  userRecord.totalDeposits += withdrawlRecord.amount;
  await userRecord.save();
}
