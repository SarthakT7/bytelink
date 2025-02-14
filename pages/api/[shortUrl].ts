import pool from "@/lib/db";
import logger from "@/lib/logger";
import { NextApiRequest, NextApiResponse } from "next";


const handleRedirectUrlRequest = async (shortUrl: string): Promise<string> => {
    try {

        logger.info(`Quering DB for ${shortUrl}`)
        const result = await pool.query(
            'SELECT long_url FROM "URL_MAPPING" WHERE short_url = $1 AND expire_at > NOW()',
            [shortUrl]
        );

        if (result.rows.length > 0) {

            const longUrl = result.rows[0].long_url;

            logger.info(`Data Found : ${longUrl}`);

            return longUrl;
        } else {
            throw new Error('URL not found or has expired');
        }
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`ERROR : ${error.name} ${error.cause} ${error.message}`)
        }
        throw error;
    }


}
const redirectHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {

        if (req.method == 'GET') {

            logger.info(`START: Handle redirect request handler.`)

            const { shortUrl } = req.query;

            logger.info(`User Input : ${shortUrl}`);

            if (typeof shortUrl !== 'string') {
                throw new Error("Expected string input")
            }

            if (!shortUrl) {
                return res.status(400).json({ error: 'Short URL is required' });
            }

            logger.info(`Manage short url request`);

            let longUrl: string = await handleRedirectUrlRequest(shortUrl);

            if (!/^https?:\/\//i.test(longUrl)) {
                longUrl = `http://${longUrl}`;
            }

            res.redirect(302, longUrl);
        }

        else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    }

    catch (error) {
        logger.error('Error processing request:', error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default redirectHandler;
