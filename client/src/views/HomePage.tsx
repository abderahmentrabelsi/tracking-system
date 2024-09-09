'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Image from 'next/image';
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  appBar: {
    backgroundColor: '#030303',
    borderBottom: '2px solid #000',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoImage: {
    marginRight: '10px',
    display: 'flex',
  },
  loginButton: {
    border: '3px solid #000',
    borderRadius: '20px',
    color: '#110a0a',
    padding: '5px 15px',
    backgroundColor: 'rgb(241,235,235)',
    '&:hover': {
      backgroundColor: '#c06767',
      color: '#e1d9d9',
    },
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to right, #00C9FF, #be60b9)',
    color: '#110a0a',
    padding: '20px',
    position: 'relative',
    flexDirection: 'column',
    '@media (min-width: 960px)': {
      flexDirection: 'row', // When screen width >= 960px (similar to 'md')
    },
  },
  content: {
    textAlign: 'left',
    maxWidth: '800px',
    zIndex: 1,
    marginBottom: '20px',
    '@media (min-width: 960px)': {
      marginBottom: 0, // Reset margin when screen width >= 960px
    },
  },
  title: {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#000',
    '@media (min-width: 960px)': {
      fontSize: '3em', // Adjust font size for wider screens
    },
  },
  description: {
    fontSize: '1em',
    marginBottom: '30px',
    color: '#000',
    fontWeight: '700',
    lineHeight: '1.4',
    width: '100%',
    '@media (min-width: 960px)': {
      fontSize: '1.2em', // Adjust font size for wider screens
    },
  },
  imageContainer: {
    zIndex: 0,
    width: '100%',
    textAlign: 'center',
    '@media (min-width: 960px)': {
      marginLeft: '50px', // Adjust margin for wider screens
      width: 'auto',
    },
  },
  footer: {
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#110a0a',
    borderTop: '2px solid #000',
    color: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    zIndex: -1,
  },
});

const HomePage: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.logo}>
            <Image src="/last.png" alt="Company Logo" width={100} height={40} className={classes.logoImage} />
          </div>
          <Button className={classes.loginButton} href="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <Container className={classes.content}>
          <Typography className={classes.title}>
            Connecting People, Empowering Teams: Your Ultimate TIME TRACKING Toolkit.
          </Typography>
          <Typography className={classes.description}>
            Unlock organizational success with our Ultimate TIME TRACKING Toolkit:<br />
            Recruiting excellence, fostering engagement, and building a thriving workplace culture.<br />
            Connect people, empower teams, and drive results.
          </Typography>
        </Container>
        <Box className={classes.imageContainer}>
          <Image src="/img2homepage.png" alt="HR Toolkit" width={800} height={536} style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>
        <div className={classes.overlay}></div>
      </main>
      <footer className={classes.footer}>
        <Typography variant="body1">© 2024 QORE VIRTUAL. All rights reserved.</Typography>
      </footer>
    </div>
  );
};

export default HomePage;
