import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { txHash } = req.body;

    try {
        const response = await fetch(`https://toncenter.com/api/v2/getTransaction?hash=${txHash}`);
        const data = await response.json();

        if (data.ok && data.result) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}