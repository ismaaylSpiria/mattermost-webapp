// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Audit} from './audits';
import {Channel} from './channels';
import {Group} from './groups';
import {Session} from './sessions';
import {Team} from './teams';
import {IDMappedObjects, RelationOneToMany, RelationOneToManyUnique, RelationOneToOne} from './utilities';

export type UserNotifyProps = {
    desktop: 'default' | 'all' | 'mention' | 'none';
    desktop_sound: 'true' | 'false';
    email: 'true' | 'false';
    mark_unread: 'all' | 'mention';
    push: 'default' | 'all' | 'mention' | 'none';
    push_status: 'ooo' | 'offline' | 'away' | 'dnd' | 'online';
    comments: 'never' | 'root' | 'any';
    first_name: 'true' | 'false';
    channel: 'true' | 'false';
    mention_keys: string;
};

export type UserProfile = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    password: string;
    auth_data: string;
    auth_service: string;
    email: string;
    email_verified: boolean;
    nickname: string;
    first_name: string;
    last_name: string;
    position: string;
    roles: string;
    allow_marketing: boolean;
    props: Record<string, string>;
    notify_props: UserNotifyProps;
    last_password_update: number;
    last_picture_update: number;
    failed_attempts: number;
    locale: string;
    timezone?: UserTimezone;
    mfa_active: boolean;
    mfa_secret: string;
    last_activity_at: number;
    is_bot: boolean;
    bot_description: string;
    bot_last_icon_update: number;
    terms_of_service_id: string;
    terms_of_service_create_at: number;
    remote_id?: string;
    status?: string;
};

export type UserProfileWithLastViewAt = UserProfile & {
    last_viewed_at: number;
};

export type UsersState = {
    currentUserId: string;
    isManualStatus: RelationOneToOne<UserProfile, boolean>;
    mySessions: Session[];
    myAudits: Audit[];
    profiles: IDMappedObjects<UserProfile>;
    profilesInTeam: RelationOneToMany<Team, UserProfile>;
    profilesNotInTeam: RelationOneToMany<Team, UserProfile>;
    profilesWithoutTeam: Set<string>;
    profilesInChannel: RelationOneToManyUnique<Channel, UserProfile>;
    profilesNotInChannel: RelationOneToManyUnique<Channel, UserProfile>;
    profilesInGroup: RelationOneToMany<Group, UserProfile>;
    profilesNotInGroup: RelationOneToMany<Group, UserProfile>;
    statuses: RelationOneToOne<UserProfile, string>;
    stats: RelationOneToOne<UserProfile, UsersStats>;
    filteredStats?: UsersStats;
    myUserAccessTokens: Record<string, UserAccessToken>;
};

export type UserTimezone = {
    useAutomaticTimezone: boolean | string;
    automaticTimezone: string;
    manualTimezone: string;
};

export type UserStatus = {
    user_id: string;
    status: string;
    manual?: boolean;
    last_activity_at?: number;
    active_channel?: string;
    dnd_end_time?: number;
};

export enum CustomStatusDuration {
    DONT_CLEAR = '',
    THIRTY_MINUTES = 'thirty_minutes',
    ONE_HOUR = 'one_hour',
    FOUR_HOURS = 'four_hours',
    TODAY = 'today',
    THIS_WEEK = 'this_week',
    DATE_AND_TIME = 'date_and_time',
    CUSTOM_DATE_TIME = 'custom_date_time',
}

export type UserCustomStatus = {
    emoji: string;
    text: string;
    duration: CustomStatusDuration;
    expires_at?: string;
};

export type UserAccessToken = {
    id: string;
    token?: string;
    user_id: string;
    description: string;
    is_active: boolean;
};

export type UsersStats = {
    total_users_count: number;
};

export type GetFilteredUsersStatsOpts = {
    in_team?: string;
    in_channel?: string;
    include_deleted?: boolean;
    include_bots?: boolean;
    roles?: string[];
    channel_roles?: string[];
    team_roles?: string[];
};

export type AuthChangeResponse = {
    follow_link: string;
};
