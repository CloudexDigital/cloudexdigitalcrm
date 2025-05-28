import React from 'react';
import styles from './footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footer}>
        {/* social icons */}
        <div className={`${styles.row} ${styles.socialRow}`}>
          <a href="#"><i className="fa fa-facebook" /></a>
          <a href="#"><i className="fa fa-instagram" /></a>
          <a href="#"><i className="fa fa-youtube" /></a>
          <a href="#"><i className="fa fa-twitter" /></a>
        </div>

        <div className={`${styles.row} ${styles.linksRow}`}>
          <ul className={styles.linkList}>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Our Services</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms &amp; Conditions</a></li>
            <li><a href="#">Career</a></li>
          </ul>
        </div>

        <div className={`${styles.row} ${styles.copyRow}`}>
          &copy; {currentYear} CLOUDEX DIGITAL — All rights reserved || Designed By: CLOUDEX DIGITAL
        </div>
      </div>
    </footer>
  );
};

export default Footer;
