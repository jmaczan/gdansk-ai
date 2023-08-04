import styles from '../pages/terms.module.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <main className={`main ${inter.className} ${styles.brandbackground}`}>
            Terms and conditions should go here
        </main>
    );
}

