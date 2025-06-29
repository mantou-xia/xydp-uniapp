"use strict";
const common_vendor = require("../../common/vendor.js");
const uni_modules_uniUpgradeCenterApp_utils_callCheckVersion = require("../../uni_modules/uni-upgrade-center-app/utils/call-check-version.js");
const uni_modules_uniIdPages_common_store = require("../../uni_modules/uni-id-pages/common/store.js");
const db = common_vendor.nr.database();
const _sfc_main = {
  data() {
    return {
      gridList: [
        {
          "text": this.$t("mine.showText"),
          "icon": "chat"
        },
        {
          "text": this.$t("mine.showText"),
          "icon": "cloud-upload"
        },
        {
          "text": this.$t("mine.showText"),
          "icon": "contact"
        },
        {
          "text": this.$t("mine.showText"),
          "icon": "download"
        }
      ],
      ucenterList: [
        [
          {
            "title": this.$t("mine.signIn"),
            "event": "signIn",
            "icon": "compose"
          },
          {
            "title": this.$t("mine.readArticles"),
            "to": "/pages/ucenter/read-news-log/read-news-log",
            "icon": "flag"
          },
          {
            "title": this.$t("mine.myScore"),
            "to": "",
            "event": "getScore",
            "icon": "paperplane"
          }
        ],
        [{
          "title": this.$t("mine.feedback"),
          "to": "/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback",
          "icon": "help"
        }, {
          "title": this.$t("mine.settings"),
          "to": "/pages/ucenter/settings/settings",
          "icon": "gear"
        }]
      ],
      listStyles: {
        "height": "150rpx",
        // 边框高度
        "width": "150rpx",
        // 边框宽度
        "border": {
          // 如果为 Boolean 值，可以控制边框显示与否
          "color": "#eee",
          // 边框颜色
          "width": "1px",
          // 边框宽度
          "style": "solid",
          // 边框样式
          "radius": "100%"
          // 边框圆角，支持百分比
        }
      }
    };
  },
  onLoad() {
  },
  onShow() {
    if (uni_modules_uniIdPages_common_store.store.hasLogin) {
      common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:173", "刷新用户信息");
      uni_modules_uniIdPages_common_store.mutations.updateUserInfo();
    }
  },
  computed: {
    userInfo() {
      return uni_modules_uniIdPages_common_store.store.userInfo;
    },
    hasLogin() {
      return uni_modules_uniIdPages_common_store.store.hasLogin;
    },
    appConfig() {
      return getApp().globalData.config;
    }
  },
  methods: {
    toSettings() {
      common_vendor.index.navigateTo({
        url: "/pages/ucenter/settings/settings"
      });
    },
    signIn() {
      this.$refs.signIn.open();
    },
    signInByAd() {
      this.$refs.signIn.showRewardedVideoAd();
    },
    /**
     * 个人中心项目列表点击事件
     */
    ucenterListClick(item) {
      if (!item.to && item.event) {
        this[item.event]();
      }
    },
    async checkVersion() {
      let res = await uni_modules_uniUpgradeCenterApp_utils_callCheckVersion.callCheckVersion();
      common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:215", res);
      if (res.result.code > 0)
        ;
      else {
        common_vendor.index.showToast({
          title: res.result.message,
          icon: "none"
        });
      }
    },
    toUserInfo() {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
      });
    },
    tapGrid(index) {
      common_vendor.index.showToast({
        // title: '你点击了，第' + (index + 1) + '个',
        title: this.$t("mine.clicked") + " " + (index + 1),
        icon: "none"
      });
    },
    /**
     * 去应用市场评分
     */
    gotoMarket() {
    },
    /**
     * 获取积分信息
     */
    getScore() {
      if (!this.userInfo)
        return common_vendor.index.showToast({
          title: this.$t("mine.checkScore"),
          icon: "none"
        });
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("uni-id-scores").where('"user_id" == $env.uid').field("score,balance").orderBy("create_date", "desc").limit(1).get().then((res) => {
        common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:278", res);
        const data = res.result.data[0];
        let msg = "";
        msg = data ? this.$t("mine.currentScore") + data.balance : this.$t("mine.noScore");
        common_vendor.index.showToast({
          title: msg,
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    async share() {
      let { result } = await db.collection("uni-id-users").where("'_id' == $cloudEnv_uid").field("my_invite_code").get();
      let myInviteCode = result.data[0].my_invite_code;
      if (!myInviteCode) {
        return common_vendor.index.showToast({
          title: "请检查uni-config-center中uni-id配置，是否已启用 autoSetInviteCode",
          icon: "none"
        });
      }
      common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:299", { myInviteCode });
      this.appConfig.about;
    },
    // 添加刷新用户信息的方法
    refreshUserInfo() {
      common_vendor.index.showLoading({
        title: "刷新中"
      });
      const db2 = common_vendor.nr.database();
      const uid = common_vendor.nr.getCurrentUserInfo().uid;
      if (!uid) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "未登录",
          icon: "none"
        });
        return;
      }
      db2.collection("uni-id-users").doc(uid).get().then((res) => {
        if (res.result.data) {
          const userData = res.result.data;
          common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:389", "获取到的用户数据:", JSON.stringify(userData));
          common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:390", "头像URL:", userData.avatar);
          common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:391", "头像文件:", JSON.stringify(userData.avatar_file));
          if (!userData.avatar && userData.avatar_file && userData.avatar_file.url) {
            common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:395", "从avatar_file创建avatar");
            userData.avatar = userData.avatar_file.url;
          }
          if (userData.avatar && (!userData.avatar_file || !userData.avatar_file.url)) {
            common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:401", "从avatar创建avatar_file");
            userData.avatar_file = {
              name: "avatar_" + Date.now() + ".png",
              extname: "png",
              url: userData.avatar
            };
            db2.collection("uni-id-users").doc(uid).update({
              avatar_file: userData.avatar_file
            }).then(() => {
              common_vendor.index.__f__("log", "at pages/ucenter/ucenter.vue:412", "avatar_file更新成功");
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/ucenter/ucenter.vue:414", "avatar_file更新失败:", err);
            });
          }
          common_vendor.index.setStorageSync("uni-id-pages-userInfo", userData);
          uni_modules_uniIdPages_common_store.store.userInfo = { ...userData };
          uni_modules_uniIdPages_common_store.store.hasLogin = true;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "刷新成功",
            icon: "success"
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/ucenter/ucenter.vue:432", "刷新用户信息失败:", err);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_sign_in2 = common_vendor.resolveComponent("uni-sign-in");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_sign_in2 + _easycom_uni_icons2 + _easycom_uni_grid_item2 + _easycom_uni_grid2 + _easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_sign_in = () => "../../uni_modules/uni-sign-in/components/uni-sign-in/uni-sign-in.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_grid_item = () => "../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_sign_in + _easycom_uni_icons + _easycom_uni_grid_item + _easycom_uni_grid + _easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.sr("signIn", "b6546e32-0"),
    b: $options.hasLogin && $options.userInfo.avatar
  }, $options.hasLogin && $options.userInfo.avatar ? {
    c: $options.userInfo.avatar
  } : $options.hasLogin && $options.userInfo.avatar_file && $options.userInfo.avatar_file.url ? {
    e: $options.userInfo.avatar_file.url
  } : {
    f: common_vendor.p({
      color: "#ffffff",
      size: "60",
      type: "person-filled"
    })
  }, {
    d: $options.hasLogin && $options.userInfo.avatar_file && $options.userInfo.avatar_file.url,
    g: $options.hasLogin
  }, $options.hasLogin ? {
    h: common_vendor.t($options.userInfo.nickname || $options.userInfo.username || $options.userInfo.mobile)
  } : {
    i: common_vendor.t(_ctx.$t("mine.notLogged"))
  }, {
    j: $options.hasLogin
  }, $options.hasLogin ? {
    k: common_vendor.p({
      size: "16",
      color: "#ffffff",
      type: "refresh"
    }),
    l: common_vendor.o((...args) => $options.refreshUserInfo && $options.refreshUserInfo(...args))
  } : {}, {
    m: common_vendor.o((...args) => $options.toUserInfo && $options.toUserInfo(...args)),
    n: common_vendor.f($data.gridList, (item, index, i0) => {
      return {
        a: "b6546e32-5-" + i0 + "," + ("b6546e32-4-" + i0),
        b: common_vendor.p({
          color: "#007AFF",
          type: item.icon,
          size: "26"
        }),
        c: common_vendor.t(item.text),
        d: common_vendor.o(($event) => $options.tapGrid(index), index),
        e: index,
        f: "b6546e32-4-" + i0 + ",b6546e32-3"
      };
    }),
    o: common_vendor.p({
      column: 4,
      showBorder: false,
      square: true
    }),
    p: common_vendor.f($data.ucenterList, (sublist, index, i0) => {
      return {
        a: common_vendor.f(sublist, (item, i, i1) => {
          return common_vendor.e({
            a: item.showBadge
          }, item.showBadge ? {
            b: common_vendor.t(item.rightText)
          } : {}, {
            c: i,
            d: common_vendor.o(($event) => $options.ucenterListClick(item), i),
            e: "b6546e32-7-" + i0 + "-" + i1 + "," + ("b6546e32-6-" + i0),
            f: common_vendor.p({
              title: item.title,
              link: true,
              rightText: item.rightText,
              clickable: true,
              to: item.to,
              ["show-extra-icon"]: true,
              extraIcon: {
                type: item.icon,
                color: "#999"
              }
            })
          });
        }),
        b: index,
        c: "b6546e32-6-" + i0
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b6546e32"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ucenter/ucenter.js.map
