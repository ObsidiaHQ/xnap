const FUND_ADDRESS = 'nano_3xnapsm113djnwnu6nd97hckkitzcu6b1gizhdxxhpqwzknj3tm1ab1meum9';
const TARGET_AMOUNT = 3000;

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
        const response = await fetch('https://rpc.nano.to', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'account_balance',
                account: FUND_ADDRESS
            })
        });

        const data = await response.json();

        balanceXNO = Math.round((Number(data?.balance_nano) || 0) + (Number(data?.receivable_nano) || 0));

        const progressBar = document.getElementById('auditProgress');
        const progressAmount = document.getElementById('progressAmount');
        const percentage = Math.min((balanceXNO * 100) / Number(TARGET_AMOUNT), 100);

        progressBar.style.width = `${percentage}%`;
        progressAmount.textContent = `${balanceXNO} XNO`;

    } catch (error) {
        console.error('Error fetching balance:', error);
        document.getElementById('progressAmount').textContent = 'Error loading balance';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAccountBalance();
});