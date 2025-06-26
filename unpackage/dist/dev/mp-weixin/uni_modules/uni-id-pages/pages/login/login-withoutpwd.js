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
              success: (userInfo) => {
                this.updateUserInfoToDb(userInfo.userInfo);
              },
              fail: () => {
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
      const uniIdCo = common_vendor.nr.importObject("uni-id-co", {
        customUI: true
      });
      uniIdCo.updateUserInfo({
        nickname: userInfo.nickName,
        avatar_file: {
          url: userInfo.avatarUrl
        }
      }).then(() => {
        uni_modules_uniIdPages_common_store.mutations.updateUserInfo({
          nickname: userInfo.nickName,
          avatar_file: {
            url: userInfo.avatarUrl
          }
        });
        this.loginSuccess();
      }).catch((e) => {
        common_vendor.index.__f__("error", "at uni_modules/uni-id-pages/pages/login/login-withoutpwd.vue:148", e);
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
