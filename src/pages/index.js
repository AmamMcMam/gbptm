import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { print } from 'graphql/language/printer';

import PageLayout from '../components/PageLayout';
import useNearbyLoos from '../components/useNearbyLoos';
import Box from '../components/Box';
import ToiletDetailsPanel from '../components/ToiletDetailsPanel';
import Sidebar from '../components/Sidebar';
import Notification from '../components/Notification';
import VisuallyHidden from '../components/VisuallyHidden';
import { useMapState } from '../components/MapState';

import config, { FILTERS_KEY } from '../config';

import FIND_LOO_BY_ID_QUERY from '../graphql/findLooById.graphql';

const LooMap = dynamic(() => import('../components/LooMap'), { ssr: false });

const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = ({ initialPosition, ...props }) => {
  const [mapState, setMapState] = useMapState();

  let initialState = config.getSettings(FILTERS_KEY);

  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialState[filter.id] = initialState[filter.id] || false;
  });

  const [filters, setFilters] = useState(initialState);

  // keep local storage and state in sync
  React.useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  const { data: toiletData } = useNearbyLoos({
    lat: mapState.center.lat,
    lng: mapState.center.lng,
    radius: Math.ceil(mapState.radius),
  });

  const { query } = useRouter();

  const selectedLooId = query.id;

  const { isValidating: loading, data } = useSWR(
    selectedLooId
      ? [print(FIND_LOO_BY_ID_QUERY), JSON.stringify({ id: selectedLooId })]
      : null
  );

  const { message } = query;

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  // restrict the results to only those toilets which pass all of our filter requirements
  const toilets = toiletData.filter((toilet) =>
    applied.every((filter) => {
      const value = toilet[filter.id];

      if (value === null) {
        return false;
      }

      return !!value;
    })
  );

  const isLooPage = Boolean(selectedLooId);

  const [shouldCenter, setShouldCenter] = React.useState(isLooPage);

  // set initial map center to toilet if on /loos/:id
  React.useEffect(() => {
    if (shouldCenter && data) {
      setMapState({
        center: data.loo.location,
      });

      // don't recenter the map each time the id changes
      setShouldCenter(false);
    }
  }, [data, shouldCenter, setMapState]);

  // set the map position if initialPosition prop exists
  React.useEffect(() => {
    if (initialPosition) {
      setMapState({
        center: initialPosition,
      });
    }
  }, [initialPosition, setMapState]);

  const [toiletPanelDimensions, setToiletPanelDimensions] = React.useState({});

  const pageTitle = config.getTitle(
    isLooPage && data ? data.loo.name || 'Unnamed Toilet' : 'Find Toilet'
  );

  return (
    <PageLayout mapCenter={mapState.center}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden>
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <Box height="100%" display="flex" position="relative">
        <Box
          position="absolute"
          zIndex={1}
          top={0}
          left={[0, 3]}
          right={0}
          m={3}
          maxWidth={326}
          maxHeight={`calc(100% - ${
            toiletPanelDimensions.height || 0
          }px - ${SIDEBAR_BOTTOM_MARGIN}px)`}
          overflowY="auto"
          // center on small viewports
          mx={['auto', 0]}
        >
          <Sidebar
            filters={filters}
            onFilterChange={setFilters}
            onSelectedItemChange={(center) => setMapState({ center })}
            onUpdateMapPosition={setMapState}
            mapCenter={mapState.center}
          />
        </Box>

        <LooMap
          loos={toilets.map((toilet) => {
            if (toilet.id === selectedLooId) {
              return {
                ...toilet,
                isHighlighted: true,
              };
            }
            return toilet;
          })}
          center={mapState.center}
          zoom={mapState.zoom}
          onViewportChanged={setMapState}
          controlsOffset={toiletPanelDimensions.height}
        />

        {Boolean(selectedLooId) && data && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel
              data={data.loo}
              isLoading={loading || !data}
              startExpanded={!!message}
              onDimensionsChange={setToiletPanelDimensions}
            >
              {config.messages[message] && (
                <Box
                  position="absolute"
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  justifyContent="center"
                  p={4}
                  pt={1}
                  pb={[4, 3, 4]}
                  bg={['white', 'white', 'transparent']}
                >
                  <Notification
                    allowClose
                    children={config.messages[message]}
                  />
                </Box>
              )}
            </ToiletDetailsPanel>
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

HomePage.propTypes = {
  initialPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default HomePage;
