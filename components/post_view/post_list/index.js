// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getRecentPostsChunkInChannel, makeGetPostsChunkAroundPost, getUnreadPostsChunk, getPost, isPostsChunkIncludingUnreadsPosts} from 'mattermost-redux/selectors/entities/posts';
import {memoizeResult} from 'mattermost-redux/utils/helpers';
import {markChannelAsRead, markChannelAsViewed} from 'mattermost-redux/actions/channels';
import {makePreparePostIdsForPostList} from 'mattermost-redux/utils/post_list';
import {RequestStatus} from 'mattermost-redux/constants';

import {updateNewMessagesAtInChannel} from 'actions/global_actions';
import {getLatestPostId} from 'utils/post_utils';
import {
    checkAndSetMobileView,
    loadPosts,
    loadUnreads,
    loadPostsAround,
    syncPostsInChannel,
    loadLatestPosts,
} from 'actions/views/channel';
import {getIsMobileView} from 'selectors/views/browser';

import PostList from './post_list.jsx';

const isFirstLoad = (state, channelId) => !state.entities.posts.postsInChannel[channelId];
const memoizedGetLatestPostId = memoizeResult((postIds) => getLatestPostId(postIds));

// This function is added as a fail safe for the channel sync issue we have.
// When the user switches to a team for the first time we show the channel of previous team and then settle for the right channel after that
// This causes the scroll correction etc an issue because post_list is not mounted for new channel instead it is updated

function makeMapStateToProps() {
    const getPostsChunkAroundPost = makeGetPostsChunkAroundPost();
    const preparePostIdsForPostList = makePreparePostIdsForPostList();

    return function mapStateToProps(state, ownProps) {
        let latestPostTimeStamp = 0;
        let postIds;
        let chunk;
        let atLatestPost = false;
        let atOldestPost = false;
        let formattedPostIds;
        const {focusedPostId, unreadChunkTimeStamp, channelId, shouldStartFromBottomWhenUnread} = ownProps;
        const channelViewState = state.views.channel;
        const lastViewedAt = channelViewState.lastChannelViewTime[channelId];
        const isPrefetchingInProcess = channelViewState.channelPrefetchStatus[channelId] === RequestStatus.STARTED;

        const focusedPost = getPost(state, focusedPostId);

        if (focusedPostId && focusedPost !== undefined && unreadChunkTimeStamp !== '') {
            chunk = getPostsChunkAroundPost(state, focusedPostId, channelId);
        } else if (unreadChunkTimeStamp && !shouldStartFromBottomWhenUnread) {
            chunk = getUnreadPostsChunk(state, channelId, unreadChunkTimeStamp);
        } else {
            chunk = getRecentPostsChunkInChannel(state, channelId);
        }

        if (chunk) {
            postIds = chunk.order;
            atLatestPost = chunk.recent;
            atOldestPost = chunk.oldest;
        }

        const shouldHideNewMessageIndicator = shouldStartFromBottomWhenUnread && !isPostsChunkIncludingUnreadsPosts(state, chunk, unreadChunkTimeStamp);

        if (postIds) {
            formattedPostIds = preparePostIdsForPostList(state, {postIds, lastViewedAt, indicateNewMessages: !shouldHideNewMessageIndicator, channelId});
            if (postIds.length) {
                const latestPostId = memoizedGetLatestPostId(postIds);
                const latestPost = getPost(state, latestPostId);
                latestPostTimeStamp = latestPost.create_at;
            }
        }

        return {
            lastViewedAt,
            isFirstLoad: isFirstLoad(state, channelId),
            formattedPostIds,
            atLatestPost,
            atOldestPost,
            latestPostTimeStamp,
            postListIds: postIds,
            isPrefetchingInProcess,
            shouldStartFromBottomWhenUnread,
            isMobileView: getIsMobileView(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadUnreads,
            loadPosts,
            loadLatestPosts,
            loadPostsAround,
            checkAndSetMobileView,
            syncPostsInChannel,
            markChannelAsViewed,
            markChannelAsRead,
            updateNewMessagesAtInChannel,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(PostList));
