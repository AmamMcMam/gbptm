import NextApp from 'next/app';
import { CacheProvider } from '@emotion/core';
import { cache } from 'emotion';
import { ThemeProvider } from 'emotion-theming';

import { MediaContextProvider } from '../components/Media';
import theme from '../theme';
import resetStyles from '../resetStyles';

import 'leaflet/dist/leaflet.css';

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <MediaContextProvider>
          <CacheProvider value={cache}>
            {resetStyles}
            <Component {...pageProps} />
          </CacheProvider>
        </MediaContextProvider>
      </ThemeProvider>
    );
  }
}
