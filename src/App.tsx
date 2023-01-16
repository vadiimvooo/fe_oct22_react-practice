import cn from 'classnames';

import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import photosFromServer from './api/photos';
import albumsFromServer from './api/albums';
import { Album, PreparedPhoto, User } from './types/types';

const getUserById = (userId: number | undefined): User | null => {
  return usersFromServer.find(user => user.id === userId) || null;
};

const getAlbumById = (albumId: number): Album | null => {
  return albumsFromServer.find(album => album.id === albumId) || null;
};

const preparedPhotos: PreparedPhoto[] = photosFromServer.map(photo => ({
  ...photo,
  album: getAlbumById(photo.albumId),
  user: getUserById(getAlbumById(photo.albumId)?.userId),
}));

export const App: React.FC = () => {
  const [photos] = useState<PreparedPhoto[]>(preparedPhotos);
  const [selectedUser, setSelectedUser] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([]);

  const filteredPhotos = photos.filter(photo => {
    const filterByUser = selectedUser !== 'All'
      ? photo.user?.name === selectedUser
      : true;

    const filterBySearchQuery = searchQuery
      ? photo.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const filterBySelectedAlbums = selectedAlbums.length !== 0
      ? selectedAlbums.includes(photo.albumId)
      : true;

    return filterByUser && filterBySearchQuery && filterBySelectedAlbums;
  });

  const handleClearButton = () => {
    setSearchQuery('');
    setSelectedUser('All');
    setSelectedAlbums([]);
  };

  const handleSelectAlbums = (albumId: number) => {
    setSelectedAlbums(prev => {
      if (prev.includes(albumId)) {
        return prev.filter(prevId => prevId !== albumId);
      }

      return [...prev, albumId];
    });
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Photos from albums</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                href="#/"
                className={cn({
                  'is-active': selectedUser === 'All',
                })}
                onClick={() => setSelectedUser('All')}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  href="#/"
                  className={cn({
                    'is-active': selectedUser === user.name,
                  })}
                  onClick={() => setSelectedUser(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <button
                    type="button"
                    className="delete"
                    style={{ visibility: `${searchQuery ? 'visible' : 'hidden'}` }}
                    onClick={() => setSearchQuery('')}
                  />
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                // className="button is-success mr-6 is-outlined"
                className={cn(
                  'button is-success mr-6',
                  { 'is-outlined': selectedAlbums.length !== 0 },
                )}
                onClick={() => setSelectedAlbums([])}
              >
                All
              </a>

              {albumsFromServer.map(album => (
                <a
                  // className="button mr-2 my-1"
                  className={cn(
                    'button mr-2 my-1',
                    { 'is-info': selectedAlbums.includes(album.id) },
                  )}
                  href="#/"
                  onClick={() => handleSelectAlbums(album.id)}
                >
                  {album.title.split(' ')[0]}
                </a>
              ))}

            </div>

            <div className="panel-block">
              <a
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleClearButton}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredPhotos.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No photos matching selected criteria
            </p>
          )}
          {filteredPhotos.length !== 0 && (
            <table
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID

                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Photo name

                      <a href="#/">
                        <span className="icon">
                          <i className="fas fa-sort-down" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Album name

                      <a href="#/">
                        <span className="icon">
                          <i className="fas fa-sort-up" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User name

                      <a href="#/">
                        <span className="icon">
                          <i className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPhotos.map(photo => (
                  <tr key={photo.id}>
                    <td className="has-text-weight-bold">
                      {photo.id}
                    </td>

                    <td>{photo.title}</td>
                    <td>{photo.album?.title}</td>

                    <td
                      // className="has-text-link"
                      className={cn({
                        'has-text-link': photo.user?.sex === 'm',
                        'has-text-danger': photo.user?.sex === 'f',
                      })}
                    >
                      {photo.user?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};
