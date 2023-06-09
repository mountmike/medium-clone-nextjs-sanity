import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../sanity/lib/client'

export const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: "2021-08-11", // or today's date for latest
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_TOKEN
};



export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { _id, name, email, comment } = JSON.parse(req.body)

    try {
        await client.create({
            _type: 'comment',
            post: {
                _type: 'reference',
                _ref: _id
            },
            name,
            email,
            comment
        })
    } catch (error) {
        return res.status(500).json({ message: "couldnt submit comment", error })
        
    }    
    console.log('comment submited')
    return res.status(200).json({ message: 'comment submitted' })
}
