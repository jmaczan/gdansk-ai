import * as React from 'react';
import axios, { AxiosRequestConfig } from 'axios';

export function initialState(args: { error?: any; isLoading?: boolean; response?: any }): any {
    return {
        response: null,
        error: null,
        isLoading: true,
        ...args
    };
}

export const usePost = (
    url: string,
    data: any = {},
    config: AxiosRequestConfig<any> = {},
): {
    error: unknown;
    isLoading: boolean;
    response: any;
} => {
    const [state, setState] = React.useState(() => initialState({}));
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post(url, data, config);

                if (res.status >= 400) {
                    setState(
                        initialState({
                            error: await res.data,
                            isLoading: false
                        })
                    );
                } else {
                    setState(
                        initialState({
                            response: await res.data,
                            isLoading: false
                        })
                    );
                }
            } catch (error) {
                setState(
                    initialState({
                        error: {
                            error: (error as any).message
                        },
                        isLoading: false
                    })
                );
            }
        };
        fetchData();
    }, []);
    return state;
};

export const useGet = (
    url: string,
    config: AxiosRequestConfig<any> = {},
): {
    error: unknown;
    isLoading: boolean;
    response: any;
} => {
    const [state, setState] = React.useState(() => initialState({}));
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(url, config);

                if (res.status >= 400) {
                    setState(
                        initialState({
                            error: res.data,
                            isLoading: false
                        })
                    );
                } else {
                    setState(
                        initialState({
                            response: res.data,
                            isLoading: false
                        })
                    );
                }
            } catch (error) {
                setState(
                    initialState({
                        error: {
                            error: (error as any).message
                        },
                        isLoading: false
                    })
                );
            }
        };
        fetchData();
    }, []);
    return state;
};

const useApi = (
    url: RequestInfo,
    options: RequestInit = {},
    body: any = {}
): {
    error: unknown;
    isLoading: boolean;
    response: any;
} => {
    const [state, setState] = React.useState(() => initialState({}));

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(url, {
                    ...options,
                    body: JSON.stringify(body)
                });

                if (res.status >= 400) {
                    setState(
                        initialState({
                            error: await res.json(),
                            isLoading: false
                        })
                    );
                } else {
                    setState(
                        initialState({
                            response: await res.json(),
                            isLoading: false
                        })
                    );
                }
            } catch (error) {
                setState(
                    initialState({
                        error: {
                            error: (error as any).message
                        },
                        isLoading: false
                    })
                );
            }
        };
        fetchData();
    }, []);
    return state;
};

export default useApi;
