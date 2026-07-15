import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useSiteData(key, fallbackData) {
    const [data, setData] = useState(fallbackData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                const { data: dbData, error: dbError } = await supabase
                    .from('site_content')
                    .select('data')
                    .eq('key', key)
                    .single();

                if (dbError) throw dbError;

                if (dbData && dbData.data && isMounted) {
                    setData(dbData.data);
                }
            } catch (err) {
                console.warn(`Failed to fetch site data for key "${key}":`, err.message);
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [key]);

    return { data, loading, error };
}
