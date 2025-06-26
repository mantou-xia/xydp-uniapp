<!-- 免密登录页 -->
<template>
	<view class="uni-content">
		<view class="login-logo">
			<image :src="logo"></image>
		</view>
		<!-- 顶部文字 -->
		<text class="title">微信快捷登录</text>
		<!-- 微信登录按钮 -->
		<text class="tip">将根据微信账号服务平台的授权范围获取你的信息</text>
		<view class="quickLogin">
			<image @click="quickLogin" src="/uni_modules/uni-id-pages/static/login/uni-fab-login/weixin.png" mode="widthFix"
				class="quickLoginBtn"></image>
			<uni-id-pages-agreements scope="register" ref="agreements"></uni-id-pages-agreements>
		</view>
		
		<!-- 隐藏其他登录方式 -->
		<!-- <uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login> -->
	</view>
</template>

<script>
	import config from '@/uni_modules/uni-id-pages/config.js'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	import {store, mutations} from '@/uni_modules/uni-id-pages/common/store.js'
	
	export default {
		mixins: [mixin],
		data() {
			return {
				type: "weixin", // 固定为微信登录
				logo: "/static/logo.png"
			}
		},
		onLoad() {
			// 初始化页面
		},
		methods: {
			quickLogin() {
				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.quickLogin)
				}
				
				uni.showLoading({
					mask: true
				})
				
				// 微信登录
				uni.login({
					"provider": "weixin",
					"onlyAuthorize": true,
					success: async e => {
						this.login({
							code: e.code
						}, 'weixin')
					},
					fail: async (err) => {
						console.log(err);
						uni.hideLoading()
						uni.showToast({
							title: '登录失败，请重试',
							icon: 'none',
							duration: 3000
						});
					}
				})
			},
			
			login(params, type) {
				console.log({params, type});
				
				const uniIdCo = uniCloud.importObject("uni-id-co", {
					customUI: true
				})
				
				uniIdCo.loginByWeixin(params)
					.then(result => {
						uni.hideLoading()
						
						// 登录成功后弹窗获取用户信息
						this.getUserProfile()
					})
					.catch(e => {
						uni.hideLoading()
						uni.showModal({
							content: e.message || '登录失败，请重试',
							confirmText: "知道了",
							showCancel: false
						});
					})
			},
			
			// 获取微信用户信息
			getUserProfile() {
				// #ifdef MP-WEIXIN
				uni.showModal({
					title: '温馨提示',
					content: '为了提供更好的服务，需要获取您的微信头像和昵称',
					confirmText: '确认授权',
					cancelText: '暂不授权',
					success: (res) => {
						if (res.confirm) {
							uni.getUserProfile({
								desc: '用于完善用户资料',
								success: (userInfoRes) => {
									// 输出获取的用户信息
									console.log("获取到的微信用户信息: ", JSON.stringify(userInfoRes.userInfo));
									// 确保获取的用户信息包含头像URL
									if (userInfoRes.userInfo && userInfoRes.userInfo.avatarUrl) {
										this.updateUserInfoToDb(userInfoRes.userInfo)
									} else {
										console.error("获取的微信用户信息不包含头像URL");
										this.loginSuccess();
									}
								},
								fail: (err) => {
									console.error("获取微信用户信息失败:", err);
									// 用户拒绝授权，仍然登录成功
									this.loginSuccess();
								}
							});
						} else {
							// 用户拒绝授权，仍然登录成功
							this.loginSuccess();
						}
					}
				});
				// #endif
				
				// #ifndef MP-WEIXIN
				// 其他平台直接登录成功
				this.loginSuccess();
				// #endif
			},
			
			// 更新用户信息到数据库
			updateUserInfoToDb(userInfo) {
				console.log("准备更新用户信息到数据库，头像URL:", userInfo.avatarUrl);
				
				// 使用云函数直接操作数据库更新用户信息
				const db = uniCloud.database();
				
				// 获取当前用户ID
				const uid = uniCloud.getCurrentUserInfo().uid;
				console.log("当前用户ID:", uid);
				
				if (!uid) {
					console.error('用户未登录或登录已过期');
					this.loginSuccess();
					return;
				}
				
				// 确保微信返回的头像URL有效（一般以https://开头）
				if (!userInfo.avatarUrl || !userInfo.avatarUrl.startsWith('http')) {
					console.error("无效的头像URL:", userInfo.avatarUrl);
					this.loginSuccess();
					return;
				}
				
				// 准备avatar_file对象
				const avatar_file = {
					name: 'avatar_' + Date.now() + '.png',
					extname: 'png',
					url: userInfo.avatarUrl
				};
				
				// 直接更新用户数据
				console.log("更新数据:", {
					nickname: userInfo.nickName,
					avatar: userInfo.avatarUrl,
					avatar_file: avatar_file,
					gender: userInfo.gender
				});
				
				db.collection('uni-id-users').doc(uid).update({
					nickname: userInfo.nickName,
					avatar: userInfo.avatarUrl,
					avatar_file: avatar_file,
					gender: userInfo.gender
				}).then(() => {
					console.log("数据库更新成功");
					
					// 直接构造用户信息并存储到本地
					let userInfoForStorage = {
						_id: uid,
						nickname: userInfo.nickName,
						avatar: userInfo.avatarUrl,
						avatar_file: avatar_file,
						gender: userInfo.gender
					};
					
					// 保存到本地存储
					uni.setStorageSync('uni-id-pages-userInfo', userInfoForStorage);
					console.log("保存到本地存储:", JSON.stringify(userInfoForStorage));
					
					// 确保store中也有正确的用户信息
					store.userInfo = {...userInfoForStorage};
					store.hasLogin = true;
					
					// 登录成功
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					
					setTimeout(() => {
						this.loginSuccess();
					}, 1500);
				}).catch(e => {
					console.error('更新用户信息失败', e);
					this.loginSuccess();
				});
			},
			
			// 登录成功
			loginSuccess() {
				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 2000
				});
				
				// 触发登录成功事件
				mutations.loginSuccess({
					showToast: false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	@media screen and (min-width: 690px) {
		.uni-content {
			height: 350px;
		}
	}

	.uni-content,
	.quickLogin {
		/* #ifndef APP-NVUE */
		display: flex;
		flex-direction: column;
		/* #endif */
	}

	.phone-box {
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
	}

	.area {
		position: absolute;
		left: 10px;
		z-index: 9;
		top: 12px;
		font-size: 14px;
	}

	.area::after {
		content: "";
		border: 3px solid transparent;
		border-top-color: #000;
		top: 12px;
		left: 3px;
		position: relative;
	}

	/* #ifdef MP */
	// 解决小程序端开启虚拟节点virtualHost引起的 class = input-box丢失的问题 [详情参考](https://uniapp.dcloud.net.cn/matter.html#%E5%90%84%E5%AE%B6%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%AE%9E%E7%8E%B0%E6%9C%BA%E5%88%B6%E4%B8%8D%E5%90%8C-%E5%8F%AF%E8%83%BD%E5%AD%98%E5%9C%A8%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%85%BC%E5%AE%B9%E9%97%AE%E9%A2%98)
	.phone-box ::v-deep .uni-easyinput__content,
	/* #endif */
	.input-box {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
		flex: 1;
		padding-left: 45px;
		margin-bottom: 10px;
		border-radius: 0;
	}

	.quickLogin {
		height: 350px;
		align-items: center;
		justify-content: center;
	}

	.quickLoginBtn {
		margin: 20px 0;
		width: 450rpx;
		/* #ifndef APP-NVUE */
		max-width: 230px;
		/* #endif */
		height: 82rpx;
	}

	.tip {
		margin-top: -15px;
		margin-bottom: 20px;
	}

	@media screen and (min-width: 690px) {
		.quickLogin {
			height: auto;
		}
	}
</style>
