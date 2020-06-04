import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from '@emotion/styled';

import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';

const StyledNavLink = styled(Link)`
  // active class is added by NavLink component
  &.active {
    color: ${(props) => props.theme.colors.tertiary};
  }
`;

// Todo: Contact link
const MainMenu = ({ mapCenter, children }) => (
  <Text
    fontWeight="bold"
    textAlign={['center', 'left']}
    css={{
      // fill container on mobile
      height: '100%',
    }}
  >
    <Box
      display="flex"
      flexDirection={['column', 'row']}
      height={['100%', 'auto']}
    >
      <Box
        as="ul"
        display="flex"
        flexDirection={['column', 'row']}
        flexGrow={1}
      >
        <Box as="li" ml={[0, 4]}>
          <StyledNavLink href="/" exact>
            Find Toilet
          </StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} ml={[0, 4]}>
          <StyledNavLink
            href={
              mapCenter
                ? `/loos/add?lat=${mapCenter.lat}&lng=${mapCenter.lng}`
                : `/loos/add`
            }
          >
            Add Toilet
          </StyledNavLink>
        </Box>

        <Box as="li" mt={['auto', 0]} ml={[0, 'auto']}>
          <StyledNavLink href="/about">About</StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} ml={[0, 4]}>
          <StyledNavLink href="/use-our-loos">Our Sponsor</StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
          <StyledNavLink href="/contact">Contact</StyledNavLink>
        </Box>
      </Box>

      {children && (
        <Box as={Media} lessThan="md">
          <Text fontWeight="normal">{children}</Text>
        </Box>
      )}
    </Box>
  </Text>
);
MainMenu.propTypes = {
  // mobile footer
  children: PropTypes.any,
};

export default MainMenu;
