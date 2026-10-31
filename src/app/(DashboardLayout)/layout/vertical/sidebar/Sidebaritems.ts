export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  // Hidden unless the staff member has this permission.
  permission?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    items: [
      {
        heading: "Dashboards",
        children: [
          {
            name: "Overview",
            icon: "solar:widget-add-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          {
            name: "Users",
            permission: "users.view",
            icon: "solar:users-group-rounded-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/users" },
              { name: "All Users", icon: "solar:users-group-rounded-line-duotone", id: uniqueId(), url: "/dashboards/users/list" },
              { name: "Reports", icon: "solar:danger-triangle-line-duotone", id: uniqueId(), url: "/dashboards/users/reports" },
              { name: "Enforcement Log", icon: "solar:clipboard-list-line-duotone", id: uniqueId(), url: "/dashboards/users/enforcement" },
              { name: "Referrals", icon: "solar:user-plus-rounded-line-duotone", id: uniqueId(), url: "/dashboards/users/referrals" },
              { name: "Notifications Sent", icon: "solar:bell-line-duotone", id: uniqueId(), url: "/dashboards/users/notifications" },
            ],
          },
          {
            name: "Posts",
            permission: "content.view",
            icon: "solar:document-text-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/posts" },
              { name: "All Posts", icon: "solar:document-text-line-duotone", id: uniqueId(), url: "/dashboards/posts/list" },
              { name: "Categories", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/posts/categories" },
              { name: "Moderation Queue", icon: "solar:shield-warning-line-duotone", id: uniqueId(), url: "/dashboards/posts/queue" },
              { name: "Reports", icon: "solar:danger-triangle-line-duotone", id: uniqueId(), url: "/dashboards/posts/reports" },
              { name: "Enforcement Log", icon: "solar:clipboard-list-line-duotone", id: uniqueId(), url: "/dashboards/posts/enforcement" },
            ],
          },
          {
            name: "Discovery",
            permission: "content.view",
            icon: "solar:hashtag-circle-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Trending", icon: "solar:fire-line-duotone", id: uniqueId(), url: "/dashboards/discovery/trending" },
              { name: "Hashtags", icon: "solar:hashtag-line-duotone", id: uniqueId(), url: "/dashboards/discovery/hashtags" },
              { name: "Mentions", icon: "solar:mention-circle-line-duotone", id: uniqueId(), url: "/dashboards/discovery/mentions" },
            ],
          },
          {
            name: "Echoes",
            permission: "content.view",
            icon: "solar:microphone-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/echoes" },
              { name: "All Echoes", icon: "solar:microphone-line-duotone", id: uniqueId(), url: "/dashboards/echoes/list" },
              { name: "Categories", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/echoes/categories" },
            ],
          },
          {
            name: "Livestreams",
            permission: "content.view",
            icon: "solar:play-stream-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/livestreams" },
              { name: "All Livestreams", icon: "solar:play-stream-line-duotone", id: uniqueId(), url: "/dashboards/livestreams/list" },
              { name: "Categories", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/livestreams/categories" },
            ],
          },
          {
            name: "VFlix",
            permission: "content.view",
            icon: "solar:video-frame-play-vertical-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/vflix" },
              { name: "Videos", icon: "solar:videocamera-record-line-duotone", id: uniqueId(), url: "/dashboards/vflix/videos" },
              { name: "Moderation", icon: "solar:flag-2-line-duotone", id: uniqueId(), url: "/dashboards/vflix/moderation" },
              { name: "Reports", icon: "solar:danger-triangle-line-duotone", id: uniqueId(), url: "/dashboards/vflix/reports" },
              { name: "Featured", icon: "solar:star-line-duotone", id: uniqueId(), url: "/dashboards/vflix/featured" },
              { name: "Creators", icon: "solar:users-group-rounded-line-duotone", id: uniqueId(), url: "/dashboards/vflix/creators" },
              { name: "Series", icon: "solar:clapperboard-play-line-duotone", id: uniqueId(), url: "/dashboards/vflix/series" },
              { name: "Trending & Hot", icon: "solar:fire-line-duotone", id: uniqueId(), url: "/dashboards/vflix/trending" },
              { name: "Analytics", icon: "solar:chart-2-line-duotone", id: uniqueId(), url: "/dashboards/vflix/analytics" },
              { name: "Monetization", icon: "solar:dollar-minimalistic-line-duotone", id: uniqueId(), url: "/dashboards/vflix/monetization" },
              { name: "Pipeline", icon: "solar:server-line-duotone", id: uniqueId(), url: "/dashboards/vflix/pipeline" },
              { name: "Catalog", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/vflix/catalog" },
              { name: "Settings", icon: "solar:settings-line-duotone", id: uniqueId(), url: "/dashboards/vflix/settings" },
            ],
          },
          {
            name: "Marketsquare",
            permission: "content.view",
            icon: "solar:shop-2-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/markets" },
              { name: "Products", icon: "solar:box-line-duotone", id: uniqueId(), url: "/dashboards/markets/products" },
              { name: "Shops", icon: "solar:shop-line-duotone", id: uniqueId(), url: "/dashboards/markets/shops" },
              { name: "Categories", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/markets/categories" },
              { name: "Reports", icon: "solar:danger-triangle-line-duotone", id: uniqueId(), url: "/dashboards/markets/reports" },
              { name: "Enforcement Log", icon: "solar:clipboard-list-line-duotone", id: uniqueId(), url: "/dashboards/markets/enforcement" },
            ],
          },
          {
            name: "Trybes",
            permission: "trybes.view",
            icon: "solar:users-group-two-rounded-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:chart-2-line-duotone", id: uniqueId(), url: "/dashboards/trybes/overview" },
              { name: "Join Requests", icon: "solar:user-check-rounded-line-duotone", id: uniqueId(), url: "/dashboards/trybes/requests" },
              { name: "All Trybes", icon: "solar:users-group-two-rounded-line-duotone", id: uniqueId(), url: "/dashboards/trybes/list" },
              { name: "Institutions", icon: "solar:buildings-2-line-duotone", id: uniqueId(), url: "/dashboards/trybes/institutions" },
              { name: "Departments", icon: "solar:notebook-line-duotone", id: uniqueId(), url: "/dashboards/trybes/departments" },
              { name: "Levels", icon: "solar:ranking-line-duotone", id: uniqueId(), url: "/dashboards/trybes/levels" },
              { name: "Campus Settings", icon: "solar:settings-line-duotone", id: uniqueId(), url: "/dashboards/trybes/settings" },
              { name: "Types", icon: "solar:library-line-duotone", id: uniqueId(), url: "/dashboards/trybes/types" },
            ],
          },
          {
            name: "Meetings",
            permission: "content.view",
            icon: "solar:videocamera-record-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:chart-2-line-duotone", id: uniqueId(), url: "/dashboards/meetings/overview" },
              { name: "All Meetings", icon: "solar:videocamera-record-line-duotone", id: uniqueId(), url: "/dashboards/meetings/list" },
              { name: "Hosts", icon: "solar:user-speak-rounded-line-duotone", id: uniqueId(), url: "/dashboards/meetings/hosts" },
              { name: "AI PM", icon: "solar:cpu-bolt-line-duotone", id: uniqueId(), url: "/dashboards/meetings/assistant" },
            ],
          },
          {
            name: "Tickets",
            permission: "tickets.view",
            icon: "solar:ticket-line-duotone",
            id: uniqueId(),
            url: "/dashboards/tickets",
          },
          {
            name: "Reports",
            permission: "reports.view",
            icon: "solar:chart-2-line-duotone",
            id: uniqueId(),
            url: "/dashboards/reports",
          },
          {
            name: "Feedback",
            permission: "tickets.view",
            icon: "solar:chat-square-like-line-duotone",
            id: uniqueId(),
            url: "/dashboards/feedback",
          },
          {
            name: "Monetization",
            permission: "finance.view",
            icon: "solar:dollar-minimalistic-line-duotone",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/monetization" },
              { name: "VS Coins", icon: "solar:dollar-minimalistic-line-duotone", id: uniqueId(), url: "/dashboards/coins" },
              { name: "Gifts", icon: "solar:gift-line-duotone", id: uniqueId(), url: "/dashboards/gifts" },
              { name: "Treasury & Wallets", icon: "solar:wallet-money-line-duotone", id: uniqueId(), url: "/dashboards/wallets" },
              { name: "Payout Holds", icon: "solar:shield-warning-line-duotone", id: uniqueId(), url: "/dashboards/payout-holds" },
              { name: "Ledger", icon: "solar:book-2-line-duotone", id: uniqueId(), url: "/dashboards/ledger" },
            ],
          },
          {
            name: "Africa Talent Challenge",
            permission: "atc.view",
            icon: "game-icons:africa",
            id: uniqueId(),
            children: [
              { name: "Overview", icon: "solar:widget-add-line-duotone", id: uniqueId(), url: "/dashboards/africa-talent-challenge" },
              { name: "Applications", icon: "solar:users-group-two-rounded-line-duotone", id: uniqueId(), url: "/dashboards/africa-talent-challenge/applications" },
              { name: "Episodes", icon: "solar:clapperboard-play-line-duotone", id: uniqueId(), url: "/dashboards/africa-talent-challenge/episodes" },
              { name: "Leaderboard", icon: "solar:ranking-line-duotone", id: uniqueId(), url: "/dashboards/africa-talent-challenge/leaderboard" },
              { name: "Suggestions", icon: "solar:magic-stick-3-line-duotone", id: uniqueId(), url: "/dashboards/africa-talent-challenge/suggestions" },
              { name: "Settings", icon: "solar:settings-line-duotone", id: uniqueId(), url: "/dashboards/atc-management" },
            ],
          },
          {
            name: "Admin Users",
            permission: "staff.manage",
            icon: "solar:users-group-rounded-line-duotone",
            id: uniqueId(),
            url: "/dashboards/admin-users",
          },
          {
            name: "Business Suite",
            icon: "fa7-solid:business-time",
            id: uniqueId(),
            url: "/dashboards/business-suite",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
