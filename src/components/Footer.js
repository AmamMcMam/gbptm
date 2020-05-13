import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styled from '@emotion/styled';

import Box from './Box';
import Text from './Text';

import config from '../config';

import domestosLogo from '../images/domestos_logo3.png';
import domestosUseLoos from '../images/domestos_use_our_loos_logo.png';

const DomestosLogo = styled((props) => (
  <img {...props} src={domestosLogo} alt="Domestos" />
))`
  height: 2rem;
`;

const UseOurLoosLogo = styled((props) => (
  <img {...props} src={domestosUseLoos} alt="Domestos: Use our loos" />
))`
  height: 2rem;
`;

const Footer = ({ showTrackingBanner, onShowTrackingBanner, props }) => (
  <Box
    as="footer"
    display="flex"
    flexDirection={['column', 'row']}
    justifyContent="space-between"
    alignItems="center"
    px={[3, 4]}
    py={[0, 2]}
    bg={['transparent', 'lightGrey']}
    color="primary"
    minHeight={60}
  >
    {config.shouldShowSponsor() && (
      <HashLink
        to="/use-our-loos"
        title="Domestos: Use Our Loos Campaign"
        scroll={(el) => el.scrollIntoView(true)}
      >
        <Box
          display="flex"
          flexDirection={['column', 'row']}
          alignItems="center"
        >
          <Text fontSize={14}>
            <small>Proudly sponsored by Domestos</small>
          </Text>

          <Box display="flex" ml={[0, 3]} mb={[3, 0]} order={[-1, 0]}>
            <UseOurLoosLogo />
            <Box ml={2}>
              <DomestosLogo />
            </Box>
          </Box>
        </Box>
      </HashLink>
    )}

    <Box order={[-1, 0]} mb={[4, 0]}>
      <Text fontSize={[12, 16]}>
        <Box as="ul" display={['block', 'flex']} alignItems="center">
          <li>
            <button
              type="button"
              aria-pressed={showTrackingBanner}
              onClick={onShowTrackingBanner}
            >
              Cookie Preferences
            </button>
          </li>
          <Box as="li" ml={[0, 4]}>
            <Link to="/privacy">Privacy Policy</Link>
          </Box>
        </Box>
      </Text>
    </Box>
  </Box>
);

Footer.propTypes = {
  showTrackingBanner: PropTypes.bool,
  onShowTrackingBanner: PropTypes.func.isRequired,
};

export default Footer;
