import Head from 'next/head';
import Link from 'next/link';
import styles from './layout.module.css';

const name = 'Hoàng Bùi Anh Tài';
export const siteTitle = 'Next.js Blog';

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="A static blog built with Next.js Pages Router"
        />
        <meta property="og:title" content={siteTitle} />
      </Head>

      {/* Header: hiển thị khác nhau tùy trang chủ hay trang con */}
      <header className={styles.header}>
        {home ? (
          <h1 className={styles.heading}>{name}</h1>
        ) : (
          <h2 className={styles.headingSm}>
            <Link href="/">{name}</Link>
          </h2>
        )}
      </header>

      {/* Nội dung chính truyền vào qua children */}
      <main>{children}</main>

      {/* Chỉ hiện nút "Back to home" khi không phải trang chủ */}
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
  );
}
