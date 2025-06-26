"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "cloud-image",
  emits: ["click"],
  props: {
    mode: {
      type: String,
      default() {
        return "widthFix";
      }
    },
    src: {
      // type:String,
      default() {
        return "";
      }
    },
    width: {
      type: String,
      default() {
        return "100rpx";
      }
    },
    height: {
      type: String,
      default() {
        return "100rpx";
      }
    }
  },
  watch: {
    src: {
      handler(src) {
        if (!src) {
          this.cSrc = "";
          return;
        }
        this.cSrc = src;
      },
      immediate: true
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  },
  data() {
    return {
      cSrc: false
    };
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cSrc
  }, $data.cSrc ? {
    b: $props.width,
    c: $props.height,
    d: $data.cSrc,
    e: $props.mode
  } : {
    f: common_vendor.p({
      color: "#999999",
      size: "30",
      type: "person-filled"
    }),
    g: $props.width,
    h: $props.height
  }, {
    i: common_vendor.o((...args) => $options.onClick && $options.onClick(...args)),
    j: $props.width,
    k: $props.height
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-id-pages/components/cloud-image/cloud-image.js.map
