"use strict";
const common_vendor = require("../../common/vendor.js");
const db = common_vendor.nr.database();
const readNewsLog = db.collection("read-news-log");
const _sfc_main = {
  data() {
    return {
      // 当前显示 _id
      id: "",
      title: "title",
      // 数据表名
      // 查询字段，多个字段用 , 分割
      // field: 'user_id.nickname,user_id._id,avatar,excerpt,last_modify_date,comment_count,like_count,title,content',
      formData: {
        noData: '<p style="text-align:center;color:#666">详情加载中...</p>'
      }
    };
  },
  computed: {
    uniStarterConfig() {
      return getApp().globalData.config;
    },
    where() {
      return `_id =="${this.id}"`;
    },
    colList() {
      return [
        db.collection("opendb-news-articles").where(this.where).field("user_id,_id,avatar,excerpt,last_modify_date,comment_count,like_count,title,content").getTemp(),
        db.collection("uni-id-users").field("_id,nickname").getTemp()
      ];
    }
  },
  onLoad(event) {
    if (event.id) {
      this.id = event.id;
    }
    if (event.title) {
      this.title = event.title;
      common_vendor.index.setNavigationBarTitle({
        title: event.title
      });
    }
  },
  onReady() {
    if (this.id) {
      this.$refs.detail.loadData();
    } else {
      common_vendor.index.showToast({
        icon: "none",
        title: this.$t("listDetail.newsErr")
      });
    }
  },
  onNavigationBarButtonTap(event) {
    if (event.type == "share") {
      this.shareClick();
    }
  },
  methods: {
    $log(...args) {
      common_vendor.index.__f__("log", "at pages/list/detail.vue:136", "args", ...args, this.id);
    },
    setReadNewsLog() {
      let item = {
        "article_id": this.id,
        "last_time": Date.now()
      }, readNewsLog2 = common_vendor.index.getStorageSync("readNewsLog") || [], index = -1;
      readNewsLog2.forEach(({ article_id }, i) => {
        if (article_id == item.article_id) {
          index = i;
        }
      });
      if (index === -1) {
        readNewsLog2.push(item);
      } else {
        readNewsLog2.splice(index, 1, item);
      }
      common_vendor.index.setStorageSync("readNewsLog", readNewsLog2);
      common_vendor.index.__f__("log", "at pages/list/detail.vue:156", readNewsLog2);
    },
    setFavorite() {
      if (common_vendor.nr.getCurrentUserInfo().tokenExpired < Date.now()) {
        return common_vendor.index.__f__("log", "at pages/list/detail.vue:160", "未登录用户");
      }
      let article_id = this.id, last_time = Date.now();
      common_vendor.index.__f__("log", "at pages/list/detail.vue:164", { article_id, last_time });
      readNewsLog.where(`"article_id" == "${article_id}" && "user_id"==$env.uid`).update({ last_time }).then(({ result: { updated } }) => {
        common_vendor.index.__f__("log", "at pages/list/detail.vue:168", "updated", updated);
        if (!updated) {
          readNewsLog.add({ article_id }).then((e) => {
            common_vendor.index.__f__("log", "at pages/list/detail.vue:171", e);
          }).catch((err) => {
            common_vendor.index.__f__("log", "at pages/list/detail.vue:173", err);
          });
        }
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/list/detail.vue:177", err);
      });
    },
    loadData(data) {
      if (this.title == "" && data[0].title) {
        this.title = data[0].title;
        common_vendor.index.setNavigationBarTitle({
          title: data[0].title
        });
      }
      this.setReadNewsLog();
    },
    /**
     * followClick
     * 点击关注
     */
    followClick() {
      common_vendor.index.showToast({
        title: this.$t("listDetail.follow"),
        icon: "none"
      });
    }
    /**
     * 分享该文章
     */
  }
};
if (!Array) {
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  (_easycom_uni_dateformat2 + _easycom_uni_list_item2 + _easycom_uni_list2 + _easycom_unicloud_db2)();
}
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
if (!Math) {
  (_easycom_uni_dateformat + _easycom_uni_list_item + _easycom_uni_list + _easycom_unicloud_db)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.title),
    b: common_vendor.w(({
      data,
      loading,
      error,
      options
    }, s0, i0) => {
      return common_vendor.e({
        a: !loading && data
      }, !loading && data ? {
        b: common_vendor.t(data.user_id && data.user_id[0] && data.user_id[0].nickname || "未知"),
        c: "495067d4-3-" + i0 + "," + ("495067d4-2-" + i0),
        d: common_vendor.p({
          date: data.last_modify_date,
          format: "yyyy-MM-dd hh:mm",
          threshold: [6e4, 2592e6]
        }),
        e: "495067d4-2-" + i0 + "," + ("495067d4-1-" + i0),
        f: common_vendor.p({
          thumbSize: "lg",
          thumb: data.image
        }),
        g: "495067d4-1-" + i0 + ",495067d4-0",
        h: common_vendor.p({
          border: false
        }),
        i: data.avatar,
        j: common_vendor.t(data.excerpt),
        k: data.content
      } : {}, {
        l: i0,
        m: s0
      });
    }, {
      name: "d",
      path: "b",
      vueId: "495067d4-0"
    }),
    c: common_vendor.sr("detail", "495067d4-0"),
    d: common_vendor.o($options.loadData),
    e: common_vendor.p({
      options: $data.formData,
      collection: $options.colList,
      getone: true,
      manual: true,
      foreignKey: "opendb-news-articles.user_id"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-495067d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/list/detail.js.map
