"use strict";
const common_vendor = require("../../../../../common/vendor.js");
const isArray = Array.isArray;
const { t } = common_vendor.initVueI18n(common_vendor.messages);
const events = {
  load: "load",
  error: "error"
};
const pageMode = {
  add: "add",
  replace: "replace"
};
const loadMode = {
  auto: "auto",
  onready: "onready",
  manual: "manual"
};
const attrs = [
  "pageCurrent",
  "pageSize",
  "collection",
  "action",
  "field",
  "getcount",
  "orderby",
  "where",
  "groupby",
  "groupField",
  "distinct"
];
const _sfc_main = {
  name: "UniClouddb",
  setup(props) {
    const dataListRef = props.ssrKey ? props.getone ? common_vendor.shallowSsrRef(void 0, props.ssrKey) : common_vendor.ssrRef([], props.ssrKey) : props.getone ? common_vendor.shallowSsrRef(void 0, "STiM+xx8Hbdli4xG4jqlGg==") : common_vendor.ssrRef([], "mrPmkot4hHYsmQ9/TgASQg==");
    const instance = common_vendor.getCurrentInstance();
    common_vendor.onMounted(() => {
      if ((!dataListRef.value || dataListRef.value.length === 0) && !props.manual && props.loadtime === loadMode.auto) {
        instance.proxy.loadData();
      }
    });
    return { dataList: dataListRef };
  },
  // 服务端serverPrefetch生命周期，用于服务端加载数据，等将来全端支持Suspense时，可以采用 Suspense + async setup 来实现一版
  async serverPrefetch() {
    if (!this.manual && this.loadtime === loadMode.auto) {
      return this.loadData();
    }
  },
  props: {
    options: {
      type: [Object, Array],
      default() {
        return {};
      }
    },
    spaceInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    collection: {
      type: [String, Array],
      default: ""
    },
    action: {
      type: String,
      default: ""
    },
    field: {
      type: String,
      default: ""
    },
    orderby: {
      type: String,
      default: ""
    },
    where: {
      type: [String, Object],
      default: ""
    },
    pageData: {
      type: String,
      default: "add"
    },
    pageCurrent: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    getcount: {
      type: [Boolean, String],
      default: false
    },
    getone: {
      type: [Boolean, String],
      default: false
    },
    gettree: {
      type: [Boolean, String, Object],
      default: false
    },
    gettreepath: {
      type: [Boolean, String],
      default: false
    },
    startwith: {
      type: String,
      default: ""
    },
    limitlevel: {
      type: Number,
      default: 10
    },
    groupby: {
      type: String,
      default: ""
    },
    groupField: {
      type: String,
      default: ""
    },
    distinct: {
      type: [Boolean, String],
      default: false
    },
    pageIndistinct: {
      type: [Boolean, String],
      default: false
    },
    foreignKey: {
      type: String,
      default: ""
    },
    loadtime: {
      type: String,
      default: "auto"
    },
    manual: {
      type: Boolean,
      default: false
    },
    ssrKey: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      hasMore: false,
      paginationInternal: {},
      errorMessage: ""
    };
  },
  computed: {
    collectionArgs() {
      return isArray(this.collection) ? this.collection : [this.collection];
    },
    isLookup() {
      return isArray(this.collection) && this.collection.length > 1 || typeof this.collection === "string" && this.collection.indexOf(",") > -1;
    },
    mainCollection() {
      if (typeof this.collection === "string") {
        return this.collection.split(",")[0];
      }
      const mainQuery = JSON.parse(JSON.stringify(this.collection[0]));
      return mainQuery.$db[0].$param[0];
    }
  },
  created() {
    this._isEnded = false;
    this.paginationInternal = {
      current: this.pageCurrent,
      size: this.pageSize,
      count: 0
    };
    this.$watch(() => {
      var al = [];
      attrs.forEach((key) => {
        al.push(this[key]);
      });
      return al;
    }, (newValue, oldValue) => {
      this.paginationInternal.size = this.pageSize;
      if (newValue[0] !== oldValue[0]) {
        this.paginationInternal.current = this.pageCurrent;
      }
      if (this.loadtime === loadMode.manual) {
        return;
      }
      let needReset = false;
      for (let i = 2; i < newValue.length; i++) {
        if (newValue[i] !== oldValue[i]) {
          needReset = true;
          break;
        }
      }
      if (needReset) {
        this.clear();
        this.reset();
      }
      this._execLoadData();
    });
  },
  methods: {
    loadData(args1, args2) {
      let callback = null;
      let clear = false;
      if (typeof args1 === "object") {
        if (args1.clear) {
          if (this.pageData === pageMode.replace) {
            this.clear();
          } else {
            clear = args1.clear;
          }
          this.reset();
        }
        if (args1.current !== void 0) {
          this.paginationInternal.current = args1.current;
        }
        if (typeof args2 === "function") {
          callback = args2;
        }
      } else if (typeof args1 === "function") {
        callback = args1;
      }
      return this._execLoadData(callback, clear);
    },
    loadMore() {
      if (this._isEnded || this.loading) {
        return;
      }
      if (this.pageData === pageMode.add) {
        this.paginationInternal.current++;
      }
      this._execLoadData();
    },
    refresh() {
      this.clear();
      this._execLoadData();
    },
    clear() {
      this._isEnded = false;
      this.dataList = [];
    },
    reset() {
      this.paginationInternal.current = 1;
    },
    add(value, {
      action,
      showToast = true,
      toastTitle,
      success,
      fail,
      complete,
      needConfirm = true,
      needLoading = true,
      loadingTitle = ""
    } = {}) {
      if (needLoading) {
        common_vendor.index.showLoading({
          title: loadingTitle
        });
      }
      let db = common_vendor.nr.database(this.spaceInfo);
      if (action) {
        db = db.action(action);
      }
      db.collection(this.mainCollection).add(value).then((res) => {
        success && success(res);
        if (showToast) {
          common_vendor.index.showToast({
            title: toastTitle || t("uniCloud.component.add.success")
          });
        }
      }).catch((err) => {
        fail && fail(err);
        if (needConfirm) {
          common_vendor.index.showModal({
            content: err.message,
            showCancel: false
          });
        }
      }).finally(() => {
        if (needLoading) {
          common_vendor.index.hideLoading();
        }
        complete && complete();
      });
    },
    remove(id, {
      action,
      success,
      fail,
      complete,
      confirmTitle,
      confirmContent,
      needConfirm = true,
      needLoading = true,
      loadingTitle = ""
    } = {}) {
      if (!id || !id.length) {
        return;
      }
      if (!needConfirm) {
        this._execRemove(id, action, success, fail, complete, needConfirm, needLoading, loadingTitle);
        return;
      }
      common_vendor.index.showModal({
        title: confirmTitle || t("uniCloud.component.remove.showModal.title"),
        content: confirmContent || t("uniCloud.component.remove.showModal.content"),
        showCancel: true,
        success: (res) => {
          if (!res.confirm) {
            return;
          }
          this._execRemove(id, action, success, fail, complete, needConfirm, needLoading, loadingTitle);
        }
      });
    },
    update(id, value, {
      action,
      showToast = true,
      toastTitle,
      success,
      fail,
      complete,
      needConfirm = true,
      needLoading = true,
      loadingTitle = ""
    } = {}) {
      if (needLoading) {
        common_vendor.index.showLoading({
          title: loadingTitle
        });
      }
      let db = common_vendor.nr.database(this.spaceInfo);
      if (action) {
        db = db.action(action);
      }
      return db.collection(this.mainCollection).doc(id).update(value).then((res) => {
        success && success(res);
        if (showToast) {
          common_vendor.index.showToast({
            title: toastTitle || t("uniCloud.component.update.success")
          });
        }
      }).catch((err) => {
        fail && fail(err);
        if (needConfirm) {
          common_vendor.index.showModal({
            content: err.message,
            showCancel: false
          });
        }
      }).finally(() => {
        if (needLoading) {
          common_vendor.index.hideLoading();
        }
        complete && complete();
      });
    },
    getTemp(isTemp = true) {
      let db = common_vendor.nr.database(this.spaceInfo);
      if (this.action) {
        db = db.action(this.action);
      }
      db = db.collection(...this.collectionArgs);
      if (this.foreignKey) {
        db = db.foreignKey(this.foreignKey);
      }
      if (!(!this.where || !Object.keys(this.where).length)) {
        db = db.where(this.where);
      }
      if (this.field) {
        db = db.field(this.field);
      }
      if (this.groupby) {
        db = db.groupBy(this.groupby);
      }
      if (this.groupField) {
        db = db.groupField(this.groupField);
      }
      if (this.distinct === true) {
        db = db.distinct();
      }
      if (this.orderby) {
        db = db.orderBy(this.orderby);
      }
      const {
        current,
        size
      } = this.paginationInternal;
      const getOptions = {};
      if (this.getcount) {
        getOptions.getCount = this.getcount;
      }
      const treeOptions = {
        limitLevel: this.limitlevel,
        startWith: this.startwith
      };
      if (this.gettree) {
        getOptions.getTree = treeOptions;
      }
      if (this.gettreepath) {
        getOptions.getTreePath = treeOptions;
      }
      db = db.skip(size * (current - 1)).limit(size);
      if (isTemp) {
        db = db.getTemp(getOptions);
        db.udb = this;
      } else {
        db = db.get(getOptions);
      }
      return db;
    },
    setResult(result) {
      if (result.code === 0) {
        this._execLoadDataSuccess(result);
      } else {
        this._execLoadDataFail(new Error(result.message));
      }
    },
    _execLoadData(callback, clear) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.errorMessage = "";
      return this._getExec().then((res) => {
        this.loading = false;
        this._execLoadDataSuccess(res.result, callback, clear);
      }).catch((err) => {
        this.loading = false;
        this._execLoadDataFail(err, callback);
      });
    },
    _execLoadDataSuccess(result, callback, clear) {
      const {
        data,
        count
      } = result;
      this._isEnded = count !== void 0 ? this.paginationInternal.current * this.paginationInternal.size >= count : data.length < this.pageSize;
      this.hasMore = !this._isEnded;
      const data2 = this.getone ? data.length ? data[0] : void 0 : data;
      if (this.getcount) {
        this.paginationInternal.count = count;
      }
      callback && callback(data2, this._isEnded, this.paginationInternal);
      this._dispatchEvent(events.load, data2);
      if (this.getone || this.pageData === pageMode.replace) {
        this.dataList = data2;
      } else {
        if (clear) {
          this.dataList = data2;
        } else {
          this.dataList.push(...data2);
        }
      }
    },
    _execLoadDataFail(err, callback) {
      this.errorMessage = err;
      callback && callback();
      this.$emit(events.error, err);
      {
        console.error(err);
      }
    },
    _getExec() {
      return this.getTemp(false);
    },
    _execRemove(id, action, success, fail, complete, needConfirm, needLoading, loadingTitle) {
      if (!this.collection || !id) {
        return;
      }
      const ids = isArray(id) ? id : [id];
      if (!ids.length) {
        return;
      }
      if (needLoading) {
        common_vendor.index.showLoading({
          mask: true,
          title: loadingTitle
        });
      }
      const db = common_vendor.nr.database(this.spaceInfo);
      const dbCmd = db.command;
      let exec = db;
      if (action) {
        exec = exec.action(action);
      }
      exec.collection(this.mainCollection).where({
        _id: dbCmd.in(ids)
      }).remove().then((res) => {
        success && success(res.result);
        if (this.pageData === pageMode.replace) {
          this.refresh();
        } else {
          this.removeData(ids);
        }
      }).catch((err) => {
        fail && fail(err);
        if (needConfirm) {
          common_vendor.index.showModal({
            content: err.message,
            showCancel: false
          });
        }
      }).finally(() => {
        if (needLoading) {
          common_vendor.index.hideLoading();
        }
        complete && complete();
      });
    },
    removeData(ids) {
      const il = ids.slice(0);
      const dl = this.dataList;
      for (let i = dl.length - 1; i >= 0; i--) {
        const index = il.indexOf(dl[i]._id);
        if (index >= 0) {
          dl.splice(i, 1);
          il.splice(index, 1);
        }
      }
    },
    _dispatchEvent(type, data) {
      if (this._changeDataFunction) {
        this._changeDataFunction(data, this._isEnded, this.paginationInternal);
      } else {
        this.$emit(type, data, this._isEnded, this.paginationInternal);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.r("d", {
      options: $props.options,
      data: $setup.dataList,
      pagination: $data.paginationInternal,
      loading: $data.loading,
      hasMore: $data.hasMore,
      error: $data.errorMessage
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js.map
