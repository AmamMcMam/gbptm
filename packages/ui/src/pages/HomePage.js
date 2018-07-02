import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/map/NearestLooMap';
import DismissableBox from '../components/DismissableBox';
import LooListItem from '../components/LooListItem';
import Notification from '../components/Notification';

import styles from './css/home-page.module.css';
import toiletMap from '../components/css/loo-map.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import { actionFindNearbyRequest } from '../redux/modules/loos';
import { actionHighlight } from '../redux/modules/mapControls';
import { actionToggleViewMode } from '../redux/modules/app';
import { actionLogin, actionLogout } from '../redux/modules/auth';

import config from '../config';

export class HomePage extends Component {
  constructor(props) {
    super(props);

    var position = this.props.geolocation.position;

    this.renderList = this.renderList.bind(this);
    this.renderMobileMap = this.renderMobileMap.bind(this);
    this.renderWelcome = this.renderWelcome.bind(this);

    if (!this.props.loos) {
      this.props.actionFindNearbyRequest(
        position.lng,
        position.lat,
        config.nearest.radius
      );
    }
  }

  renderList() {
    var loos = this.props.loos;

    // Loading
    if (!loos) {
      return (
        <Notification>
          <p>Fetching toilets&hellip;</p>
        </Notification>
      );
    }

    // No results
    if (loos && !loos.length) {
      return (
        <Notification>
          <p>No nearby loos found.</p>
        </Notification>
      );
    }

    return (
      <div>
        <h2 className={headings.large}>Nearest Toilets</h2>
        <ul className={styles.looList}>
          {loos &&
            loos.slice(0, config.nearest.limit).map((loo, i) => (
              <li key={i} className={styles.looListItem}>
                <LooListItem
                  loo={loo}
                  onHoverStart={_.partial(this.props.actionHighlight, loo)}
                  onHoverEnd={_.partial(this.props.actionHighlight, undefined)}
                />
              </li>
            ))}
        </ul>
      </div>
    );
  }

  // Rendered as a tab on mobile devices
  renderMobileMap() {
    var loos = this.props.loos;

    return (
      <div className={styles.mobileMap}>
        <div className={toiletMap.map}>
          {!loos && (
            <div className={toiletMap.loading}>Fetching toilets&hellip;</div>
          )}
          <NearestLooMap />
        </div>
      </div>
    );
  }

  renderWelcome() {
    var content = `
            <p>The ${
              config.nearest.limit
            } nearest toilets are listed below. Click more info to find out about
            each toilet's features.</p><p>You can set preferences to highlight toilets that meet your specific
            needs.</p>
        `;

    return (
      <DismissableBox persistKey="home-welcome" title="Hi!" content={content} />
    );
  }

  renderMain() {
    var mode = this.props.app.viewMode;

    return (
      <div className={styles.container}>
        {/* Logged in message */}
        {this.props.isAuthenticated && (
          <Notification>
            <p>
              Logged in. <button onClick={this.props.doLogout}>Log out</button>
            </p>
          </Notification>
        )}

        <div className={layout.controls}>
          {config.allowAddEditLoo && (
            <Link to="/report" className={controls.btn}>
              Add a toilet
            </Link>
          )}

          <MediaQuery maxWidth={config.viewport.mobile}>
            <button
              className={controls.btn}
              onClick={this.props.actionToggleViewMode}
            >
              {mode === 'list' ? 'View map' : 'View list'}
            </button>
          </MediaQuery>
        </div>

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          {mode === 'list' && this.renderWelcome()}
          {mode === 'list' && this.renderList()}
          {mode === 'map' && this.renderMobileMap()}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {this.renderWelcome()}
          {this.renderList()}
        </MediaQuery>
      </div>
    );
  }

  renderMap() {
    return <NearestLooMap />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

HomePage.propTypes = {
  loos: PropTypes.array,
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  loos: state.loos.nearby,
  app: state.app,
  isAuthenticated: state.auth.isAuthenticated,
});

var mapDispatchToProps = {
  actionFindNearbyRequest,
  actionHighlight,
  actionToggleViewMode,
  doLogout: actionLogout,
  doLogin: actionLogin,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);