const FUND_ADDRESS = 'nano_3xnapsm113djnwnu6nd97hckkitzcu6b1gizhdxxhpqwzknj3tm1ab1meum9';
const TARGET_AMOUNT = 5500;

function copyAddress() {
    navigator.clipboard.writeText(FUND_ADDRESS)
        .then(() => {
            const btn = document.querySelector('.copy-btn');
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = 'Copy';
            }, 2000);
        });
}

async function fetchAccountBalance() {
    try {
        const method = 'POST';
        const headers = {
            'Content-Type': 'application/json'
        };
        const [balanceXNO, rate] = await Promise.all([
            fetch('https://rpc.nano.to', {
                method,
                headers,
                body: JSON.stringify({
                    action: 'account_balance',
                    account: FUND_ADDRESS
                })
            })
                .then(response => response.json())
                .then(data => {
                    return Math.round((Number(data?.balance_nano) || 0) + (Number(data?.receivable_nano) || 0));
                }),

            fetch('https://rpc.nano.to', {
                method,
                headers,
                body: JSON.stringify({
                    action: 'market_data',
                })
            })
                .then(response => response.json())
                .then(data => Math.round(data.market_data?.current_price?.usd || 1))
        ]);

        const balanceUSD = balanceXNO * rate;
        const progressBar = document.getElementById('auditProgress');
        const progressAmount = document.getElementById('progressAmount');
        const progressPct = document.getElementById('auditProgressPct');
        const percentage = Math.min((balanceUSD * 100) / Number(TARGET_AMOUNT), 100);

        progressBar.style.width = `${percentage}%`;
        progressAmount.textContent = `${balanceUSD} USD (${balanceXNO} XNO)`;
        progressPct.textContent = `${percentage.toFixed(1)}%`;
    } catch (error) {
        console.error('Error fetching balance:', error);
        document.getElementById('progressAmount').textContent = 'Error loading balance';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAccountBalance();
});