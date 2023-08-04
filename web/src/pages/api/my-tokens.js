import { getAccessToken } from '@auth0/nextjs-auth0';
import axios from 'axios';
import { api } from 'utils/api';

export default (async (req, res) => {
    try {
        const { accessToken } = await getAccessToken(req, res, {
            scopes: ['openid']
        });

        const response = await axios.get(api('my-tokens'),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
            }).then((res) => {
                return res
            }).catch((err) => {
                console.log(err);
                return err
            });

        res.status(response.status || 200).send(response.data)
    } catch (errorWrapped) {
        const error = errorWrapped;
        console.error(error);
        res.status(error.status || 400).json({
            code: error.code,
            error: error.message
        });
    }
});
