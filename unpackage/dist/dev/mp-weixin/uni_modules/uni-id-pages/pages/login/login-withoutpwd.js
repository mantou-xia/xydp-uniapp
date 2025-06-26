"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIdPages_common_loginPage_mixin = require("../../common/login-page.mixin.js");
const uni_modules_uniIdPages_common_store = require("../../common/store.js");
const common_assets = require("../../../../common/assets.js");
const _sfc_main = {
  mixins: [uni_modules_uniIdPages_common_loginPage_mixin.mixin],
  data() {
    return {
      type: "weixin",
      // 固定为微信登录
      logo: "/static/logo.png"
    };
  },
  onLoad() {
  },
  methods: {
    quickLogin() {
      if (this.needAgreements && !this.agree) {
        return this.$refs.agreements.popup(this.quickLogin);
      }
      common_vendor.index.showLoading({
        mask: true
      });
      common_vendor.index.login({
        "provider": "weixin",
        "onlyAuthorize": true,
        success: async (e) => {
          this.login({
            code: e.code
          }, "weixin");
        },
        fail: async (err) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:58", err);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none",
            duration: 3e3
          });
        }
      });
    },
    login(params, type) {
      common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:70", { params, type });
      const uniIdCo = common_vendor.nr.importObject("uni-id-co", {
        customUI: true
      });
      uniIdCo.loginByWeixin(params).then((result) => {
        common_vendor.index.hideLoading();
        this.getUserProfile();
      }).catch((e) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          content: e.message || "登录失败，请重试",
          confirmText: "知道了",
          showCancel: false
        });
      });
    },
    // 获取微信用户信息
    getUserProfile() {
      common_vendor.index.showModal({
        title: "温馨提示",
        content: "为了提供更好的服务，需要获取您的微信头像和昵称",
        confirmText: "确认授权",
        cancelText: "暂不授权",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.getUserProfile({
              desc: "用于完善用户资料",
              success: (userInfoRes) => {
                common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:107", "获取到的微信用户信息: ", JSON.stringify(userInfoRes.userInfo));
                if (userInfoRes.userInfo && userInfoRes.userInfo.avatarUrl) {
                  this.updateUserInfoToDb(userInfoRes.userInfo);
                } else {
                  common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:112", "获取的微信用户信息不包含头像URL");
                  this.loginSuccess();
                }
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:117", "获取微信用户信息失败:", err);
                this.loginSuccess();
              }
            });
          } else {
            this.loginSuccess();
          }
        }
      });
    },
    // 更新用户信息到数据库
    updateUserInfoToDb(userInfo) {
      common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:138", "准备更新用户信息到数据库，头像URL:", userInfo.avatarUrl);
      const db = common_vendor.nr.database();
      const uid = common_vendor.nr.getCurrentUserInfo().uid;
      common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:145", "当前用户ID:", uid);
      if (!uid) {
        common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:148", "用户未登录或登录已过期");
        this.loginSuccess();
        return;
      }
      if (!userInfo.avatarUrl || !userInfo.avatarUrl.startsWith("http")) {
        common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:155", "无效的头像URL:", userInfo.avatarUrl);
        this.loginSuccess();
        return;
      }
      const avatar_file = {
        name: "avatar_" + Date.now() + ".png",
        extname: "png",
        url: userInfo.avatarUrl
      };
      common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:168", "更新数据:", {
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        avatar_file,
        gender: userInfo.gender
      });
      db.collection("uni-id-users").doc(uid).update({
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        avatar_file,
        gender: userInfo.gender
      }).then(() => {
        common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:181", "数据库更新成功");
        let userInfoForStorage = {
          _id: uid,
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          avatar_file,
          gender: userInfo.gender
        };
        common_vendor.index.setStorageSync("uni-id-pages-userInfo", userInfoForStorage);
        common_vendor.index.__f__("log", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:194", "保存到本地存储:", JSON.stringify(userInfoForStorage));
        uni_modules_uniIdPages_common_store.store.userInfo = { ...userInfoForStorage };
        uni_modules_uniIdPages_common_store.store.hasLogin = true;
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          this.loginSuccess();
        }, 1500);
      }).catch((e) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:210", "更新用户信息失败", e);
        this.loginSuccess();
      });
    },
    // 登录成功
    loginSuccess() {
      common_vendor.index.showToast({
        title: "登录成功",
        icon: "success",
        duration: 2e3
      });
      uni_modules_uniIdPages_common_store.mutations.loginSuccess({
        showToast: false
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_id_pages_agreements2 = common_vendor.resolveComponent("uni-id-pages-agreements");
  _easycom_uni_id_pages_agreements2();
}
const _easycom_uni_id_pages_agreements = () => "../../components/uni-id-pages-agreements/uni-id-pages-agreements.js";
if (!Math) {
  _easycom_uni_id_pages_agreements();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.logo,
    b: common_vendor.o((...args) => $options.quickLogin && $options.quickLogin(...args)),
    c: common_assets._imports_0$2,
    d: common_vendor.sr("agreements", "f1f87fcd-0"),
    e: common_vendor.p({
      scope: "register"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f1f87fcd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-id-pages/pages/login/login-withoutpwd.js.map
