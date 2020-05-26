import React, { useState } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import Box from './Box';
import Text from './Text';
import Icon from './Icon';
import Spacer from './Spacer';

const Notification = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      role="alert"
      aria-live="assertive"
      display="flex"
      justifyContent="space-between"
      py={2}
      px={3}
      color="primary"
      bg="secondary"
    >
      <Text textAlign="center" fontWeight="bold">
        {children}
      </Text>

      <Spacer ml={2} />

      <button
        type="button"
        aria-label="Close notification"
        onClick={() => setIsVisible(false)}
      >
        <Icon icon={faTimes} />
      </button>
    </Box>
  );
};

export default Notification;
