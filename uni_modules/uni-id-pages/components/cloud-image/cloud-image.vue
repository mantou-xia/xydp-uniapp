<template>
	<view @click="onClick" :style="{width,height}" style="justify-content: center;">
		<image v-if="cSrc" :style="{width,height}" :src="cSrc" :mode="mode"></image>
		<view v-else style="background-color: #f5f5f5; display: flex; justify-content: center; align-items: center;" :style="{width,height}">
			<uni-icons color="#999999" size="30" type="person-filled" />
		</view>
	</view>
</template>

<script>
	/**
	* cloud-image 
	* @description 兼容普通资源和unicloud图片资源渲染的组件
	* @property {String} mode	图片裁剪、缩放的模式。默认为widthFix，支持所有image组件的mode值
	* @property {String} src	资源完了链接或uniCloud云存储资源的fileid
	* @property {String} width	图片的宽，默认为：100rpx
	* @property {String} height	图片的高，默认为：100rpx
	* @event {Function} click 点击 cloud-image 触发事件
	*/
	export default {
		name: "cloud-image",
		emits:['click'],
		props: {
			mode: {
				type:String,
				default () {
					return 'widthFix'
				}
			},
			src: {
				// type:String,
				default () {
					return ""
				}
			},
			width: {
				type:String,
				default () {
					return '100rpx'
				}
			},
			height: {
				type:String,
				default () {
					return '100rpx'
				}
			}
		},
		watch: {
			src:{
				handler(src) {
					if(!src) {
						this.cSrc = '';
						return;
					}
					
					// 直接使用提供的URL，不做云处理
					this.cSrc = src;
				},
				immediate: true
			}
		},
		methods:{
			onClick(){
				this.$emit('click')
			}
		},
		data() {
			return {
				cSrc:false
			};
		}
	}
</script>