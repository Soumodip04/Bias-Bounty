module 0xd352cdfd4be4971ca3dc6a63298e69127e49d66b80d9e0e4fea2840d64bc2710::biasbounty {

    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::signer;

    /// Simple function: lets the sender reward another user with APT
    public entry fun reward_user(sender: &signer, recipient: address, amount: u64) {
        coin::transfer<AptosCoin>(sender, recipient, amount);
    }
}
