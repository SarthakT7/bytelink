import { convertToURL } from "@/lib/convert-to-url-util";
import pool from "@/lib/db";
import logger from "@/lib/logger";
import { ShortUrlUtil } from "@/lib/short-url-util";
import { NextApiRequest, NextApiResponse } from "next";

const handleShortenUrlRequest = async (originalUrl: string) => {

    const shortenedUrl = ShortUrlUtil.generateShortUrl(originalUrl);

    logger.info(`Generated short URL : ${shortenedUrl}`);

    try {
        const result = await pool.query(
            `INSERT INTO "URL_MAPPING" (long_url, short_url, created_at, expire_at) 
             VALUES ($1, $2, NOW(), NOW() + INTERVAL '1 day') 
             ON CONFLICT (long_url) 
             DO UPDATE 
             SET short_url = EXCLUDED.short_url, 
                 created_at = EXCLUDED.created_at, 
                 expire_at = EXCLUDED.expire_at 
             RETURNING *`,
            [originalUrl, shortenedUrl]
        );

        logger.info(`Successfully posted to DB`);

        return result;
    }

    catch (error) {
        logger.error(`Error while posting data to database.`)
        throw error;
    }
}
const shortenHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {

        if (req.method == 'POST') {

            logger.info(`START: Handle short request handler.`)

            const originalUrl: string = req.body;

            logger.info(`User Input : ${originalUrl}`);

            if (!originalUrl) {
                return res.status(400).json({ error: 'Original URL is required' });
            }

            logger.info(`Manage short url request`);

            const dbResult = await handleShortenUrlRequest(originalUrl);

            if (dbResult && dbResult.rows && dbResult.rows.length == 1) {
                logger.info(`END: Result is ${JSON.stringify(dbResult.rows[0])}`);

                let result = dbResult.rows[0];

                if (result['short_url']) {
                    result['short_url'] = convertToURL(result['short_url'], true);
                }

                if (result['long_url']) {
                    result['long_url'] = convertToURL(result['long_url'])
                }
                res.status(200).json(result)

            }

            else {
                return res.status(204).json({ error: 'Data not found' });
            }
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

export default shortenHandler;
