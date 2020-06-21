import React from 'react';
import { makeStyles } from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';

const useStyles = makeStyles(theme => ({
  multiply: {
    mixBlendMode: 'multiply'
  },
  overlay: {
    mixBlendMode: 'overlay'
  }
}));

const AlpsIcon = (props) => {
  const styles = useStyles();

  return (
    <SvgIcon {...props}>
      <defs>
        <linearGradient id="a" x1="16.752" y1="14.742" x2="12" y2="6.511"
          gradientTransform="translate(7.239 -5.764) rotate(30)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#231f20" stopOpacity="0" />
          <stop offset="1" />
        </linearGradient>
      </defs>
      <g isolation="isolate">
        <path
          d="M18.336,14.322l-4.965-8.6L10.629,7.307l4.971,8.61a3.134,3.134,0,0,0-.433,1.572,3.167,3.167,0,1,0,3.169-3.166Z" />
        <path
          d="M18.336,14.322l-4.965-8.6L10.629,7.307l4.971,8.61a3.134,3.134,0,0,0-.433,1.572,3.167,3.167,0,1,0,3.169-3.166Z"
          opacity={0.1}
          className={styles.multiply}
          fill="#231f20" />
        <path
          d="M18.336,14.322l-4.965-8.6L10.629,7.307l4.971,8.61a3.134,3.134,0,0,0-.433,1.572,3.167,3.167,0,1,0,3.169-3.166Z"
          opacity={0.5}
          className={styles.overlay}
          fill="#231f20" />
        <rect x="12.793" y="5.875" width="3.167" height="9.504"
          transform="matrix(0.866, -0.5, 0.5, 0.866, -3.387, 8.612)"
          fill="url(#a)"
          className={styles.multiply} />
        <path
          d="M15.167,6.511a3.167,3.167,0,0,0-6.333,0,3.134,3.134,0,0,0,.433,1.572l-3.6,6.239a3.167,3.167,0,1,0,3.169,3.166A3.134,3.134,0,0,0,8.4,15.917L12,9.678A3.167,3.167,0,0,0,15.167,6.511Z" />
      </g>
    </SvgIcon>
  )
};

export default AlpsIcon;
