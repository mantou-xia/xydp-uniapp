<template>
	<view class="center">
		<uni-sign-in ref="signIn"></uni-sign-in>
		<view class="userInfo" @click.capture="toUserInfo">
			<!-- 直接使用image组件显示头像 -->
			<view class="avatar-box">
				<image v-if="hasLogin && userInfo.avatar" class="avatar-image" :src="userInfo.avatar" mode="aspectFill"></image>
				<!-- 如果没有avatar，尝试使用avatar_file.url -->
				<image v-else-if="hasLogin && userInfo.avatar_file && userInfo.avatar_file.url" class="avatar-image" :src="userInfo.avatar_file.url" mode="aspectFill"></image>
				
				<view v-else class="defaultAvatarUrl">
					<uni-icons color="#ffffff" size="60" type="person-filled" />
				</view>
			</view>
			
			<view class="logo-title">
				<text class="uer-name" v-if="hasLogin">{{userInfo.nickname||userInfo.username||userInfo.mobile}}</text>
				<text class="uer-name" v-else>{{$t('mine.notLogged')}}</text>
			</view>
			
			<!-- 刷新按钮 -->
			<view v-if="hasLogin" @click.stop="refreshUserInfo" class="refresh-btn">
				<uni-icons size="16" color="#ffffff" type="refresh"></uni-icons>
				<text class="refresh-text">刷新</text>
			</view>
		</view>
		<uni-grid class="grid" :column="4" :showBorder="false" :square="true">
			<uni-grid-item class="item" v-for="(item,index) in gridList" @click.native="tapGrid(index)" :key="index">
				<uni-icons class="icon" color="#007AFF" :type="item.icon" size="26"></uni-icons>
				<text class="text">{{item.text}}</text>
			</uni-grid-item>
		</uni-grid>
		<uni-list class="center-list" v-for="(sublist , index) in ucenterList" :key="index">
			<uni-list-item v-for="(item,i) in sublist" :title="item.title" link :rightText="item.rightText" :key="i"
				:clickable="true" :to="item.to" @click="ucenterListClick(item)" :show-extra-icon="true"
				:extraIcon="{type:item.icon,color:'#999'}">
				<template v-slot:footer>
					<view v-if="item.showBadge" class="item-footer">
						<text class="item-footer-text">{{item.rightText}}</text>
						<view class="item-footer-badge"></view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update';
	import callCheckVersion from '@/uni_modules/uni-upgrade-center-app/utils/call-check-version';
	// #ifdef APP
	import UniShare from '@/uni_modules/uni-share/js_sdk/uni-share.js';
	const uniShare = new UniShare()
	// #endif
	const db = uniCloud.database();
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		// #ifdef APP
		onBackPress({from}) {
			if(from=='backbutton'){
				this.$nextTick(function(){
					uniShare.hide()
				})
				return uniShare.isShow;
			}
		},
		// #endif
		data() {
			return {
				gridList: [{
						"text": this.$t('mine.showText'),
						"icon": "chat"
					},
					{
						"text": this.$t('mine.showText'),
						"icon": "cloud-upload"
					},
					{
						"text": this.$t('mine.showText'),
						"icon": "contact"
					},
					{
						"text": this.$t('mine.showText'),
						"icon": "download"
					}
				],
				ucenterList: [
					[
						// #ifdef APP-PLUS
						{
							"title": this.$t('mine.signInByAd'),
							"event": 'signInByAd',
							"icon": "compose"
						},
						// #endif
						{
							"title": this.$t('mine.signIn'),
							"event": 'signIn',
							"icon": "compose"
						},
						// #ifdef APP-PLUS
						{
							"title": this.$t('mine.toEvaluate'),
							"event": 'gotoMarket',
							"icon": "star"
						},
						//#endif
						{
							"title":this.$t('mine.readArticles'),
							"to": '/pages/ucenter/read-news-log/read-news-log',
							"icon": "flag"
						},
						{
							"title": this.$t('mine.myScore'),
							"to": '',
							"event": 'getScore',
							"icon": "paperplane"
						}
						// #ifdef APP
						, {
							"title": this.$t('mine.invite'),
							"event": 'share',
							"icon": "redo"
						}
						// #endif
					],
					[{
						"title": this.$t('mine.feedback'),
						"to": '/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback',
						"icon": "help"
					}, {
						"title": this.$t('mine.settings'),
						"to": '/pages/ucenter/settings/settings',
						"icon": "gear"
					}],
					// #ifdef APP
					[{
						"title": this.$t('mine.about'),
						"to": '/pages/ucenter/about/about',
						"icon": "info"
					}]
					// #endif
				],
				listStyles: {
					"height": "150rpx", // 边框高度
					"width": "150rpx", // 边框宽度
					"border": { // 如果为 Boolean 值，可以控制边框显示与否
						"color": "#eee", // 边框颜色
						"width": "1px", // 边框宽度
						"style": "solid", // 边框样式
						"radius": "100%" // 边框圆角，支持百分比
					}
				}
			}
		},
		onLoad() {
			//#ifdef APP-PLUS
			this.ucenterList[this.ucenterList.length - 2].unshift({
				title:this.$t('mine.checkUpdate'),// this.this.$t('mine.checkUpdate')"检查更新"
				rightText: this.appVersion.version + '-' + this.appVersion.versionCode,
				event: 'checkVersion',
				icon: 'loop',
				showBadge: this.appVersion.hasNew
			})
			//#endif
		},
		onShow() {
			// 刷新用户信息
			if(store.hasLogin) {
				console.log("刷新用户信息");
				mutations.updateUserInfo();
			}
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin(){
				return store.hasLogin
			},
			// #ifdef APP-PLUS
			appVersion() {
				return getApp().appVersion
			},
			// #endif
			appConfig() {
				return getApp().globalData.config
			}
		},
		methods: {
			toSettings() {
				uni.navigateTo({
					url: "/pages/ucenter/settings/settings"
				})
			},
			signIn() { //普通签到
				this.$refs.signIn.open()
			},
			signInByAd(){ //看激励视频广告签到
				this.$refs.signIn.showRewardedVideoAd()
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
				let res = await callCheckVersion()
				console.log(res);
				if (res.result.code > 0) {
					checkUpdate()
				} else {
					uni.showToast({
						title: res.result.message,
						icon: 'none'
					});
				}
			},
			toUserInfo() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				})
			},
			tapGrid(index) {
				uni.showToast({
					// title: '你点击了，第' + (index + 1) + '个',
					title: this.$t('mine.clicked') + " " + (index + 1) ,
					icon: 'none'
				});
			},
			/**
			 * 去应用市场评分
			 */
			gotoMarket() {
				// #ifdef APP-PLUS
				if (uni.getSystemInfoSync().platform == "ios") {
					// 这里填写appstore应用id
					let appstoreid = this.appConfig.marketId.ios; // 'id1417078253';
					console.log({appstoreid});
					plus.runtime.openURL("itms-apps://" + 'itunes.apple.com/cn/app/wechat/' + appstoreid + '?mt=8',err=>{
						console.log('plus.runtime.openURL err:' + JSON.stringify(err));
					});
				}
				if (uni.getSystemInfoSync().platform == "android") {
					var Uri = plus.android.importClass("android.net.Uri");
					var uri = Uri.parse("market://details?id=" + this.appConfig.marketId.android);
					var Intent = plus.android.importClass('android.content.Intent');
					var intent = new Intent(Intent.ACTION_VIEW, uri);
					var main = plus.android.runtimeMainActivity();
					main.startActivity(intent);
				}
				// #endif
			},
			/**
			 * 获取积分信息
			 */
			getScore() {
				if (!this.userInfo) return uni.showToast({
					title: this.$t('mine.checkScore'),
					icon: 'none'
				});
				uni.showLoading({
					mask: true
				})
				db.collection("uni-id-scores")
					.where('"user_id" == $env.uid')
					.field('score,balance')
					.orderBy("create_date", "desc")
					.limit(1)
					.get()
					.then((res) => {
						console.log(res);
						const data = res.result.data[0];
						let msg = '';
						msg = data ? (this.$t('mine.currentScore')+ data.balance) : this.$t('mine.noScore');
						uni.showToast({
							title: msg,
							icon: 'none'
						});
					}).finally(()=>{
						uni.hideLoading()
					})
			},
			async share() {
				let {result} = await db.collection('uni-id-users').where("'_id' == $cloudEnv_uid").field('my_invite_code').get()
				let myInviteCode = result.data[0].my_invite_code
				if(!myInviteCode){
					return uni.showToast({
						title: '请检查uni-config-center中uni-id配置，是否已启用 autoSetInviteCode',
						icon: 'none'
					});
				}
				console.log({myInviteCode});
				let {
					appName,
					logo,
					company,
					slogan
				} = this.appConfig.about
				// #ifdef APP
				uniShare.show({
					content: { //公共的分享类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
						type: 0,
						href: this.appConfig.h5.url +
							`/#/pages/ucenter/invite/invite?code=uniInvitationCode:${myInviteCode}`,
						title: appName,
						summary: slogan,
						imageUrl: logo +
							'?x-oss-process=image/resize,m_fill,h_100,w_100' //压缩图片解决，在ios端分享图过大导致的图片失效问题
					},
					menus: [{
							"img": "/static/app/sharemenu/wechatfriend.png",
							"text": this.$t('common.wechatFriends'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneSession"
							}
						},
						{
							"img": "/static/app/sharemenu/wechatmoments.png",
							"text": this.$t('common.wechatBbs'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneTimeline"
							}
						},
						{
							"img": "/static/app/sharemenu/weibo.png",
							"text": this.$t('common.weibo'),
							"share": {
								"provider": "sinaweibo"
							}
						},
						{
							"img": "/static/app/sharemenu/qq.png",
							"text": "QQ",
							"share": {
								"provider": "qq"
							}
						},
						{
							"img": "/static/app/sharemenu/copyurl.png",
							"text": this.$t('common.copy'),
							"share": "copyurl"
						},
						{
							"img": "/static/app/sharemenu/more.png",
							"text": this.$t('common.more'),
							"share": "shareSystem"
						}
					],
					cancelText: this.$t('common.cancelShare'),
				}, e => { //callback
					console.log(e);
				})
				// #endif
			},
			// 添加刷新用户信息的方法
			refreshUserInfo() {
				uni.showLoading({
					title: '刷新中'
				});
				
				const db = uniCloud.database();
				const uid = uniCloud.getCurrentUserInfo().uid;
				
				if (!uid) {
					uni.hideLoading();
					uni.showToast({
						title: '未登录',
						icon: 'none'
					});
					return;
				}
				
				// 从数据库获取最新的用户信息
				db.collection('uni-id-users').doc(uid).get().then(res => {
					if(res.result.data) {
						// 直接更新本地存储
						const userData = res.result.data;
						
						// 输出详细的用户信息用于调试
						console.log("获取到的用户数据:", JSON.stringify(userData));
						console.log("头像URL:", userData.avatar);
						console.log("头像文件:", JSON.stringify(userData.avatar_file));
						
						// 如果avatar_file存在但avatar不存在，从avatar_file创建avatar
						if (!userData.avatar && userData.avatar_file && userData.avatar_file.url) {
							console.log("从avatar_file创建avatar");
							userData.avatar = userData.avatar_file.url;
						}
						
						// 如果avatar存在但avatar_file不存在，创建avatar_file
						if (userData.avatar && (!userData.avatar_file || !userData.avatar_file.url)) {
							console.log("从avatar创建avatar_file");
							userData.avatar_file = {
								name: 'avatar_' + Date.now() + '.png',
								extname: 'png',
								url: userData.avatar
							};
							
							// 更新数据库的avatar_file
							db.collection('uni-id-users').doc(uid).update({
								avatar_file: userData.avatar_file
							}).then(() => {
								console.log("avatar_file更新成功");
							}).catch(err => {
								console.error("avatar_file更新失败:", err);
							});
						}
						
						// 更新本地存储
						uni.setStorageSync('uni-id-pages-userInfo', userData);
						
						// 强制更新本地状态
						store.userInfo = {...userData};
						store.hasLogin = true;
						
						uni.hideLoading();
						uni.showToast({
							title: '刷新成功',
							icon: 'success'
						});
					}
				}).catch((err) => {
					console.error("刷新用户信息失败:", err);
					uni.hideLoading();
					uni.showToast({
						title: '刷新失败',
						icon: 'none'
					});
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	page {
		background-color: #f8f8f8;
	}
	/* #endif*/
	
	.center {
		flex: 1;
		flex-direction: column;
		background-color: #f8f8f8;
	}

	.userInfo {
		padding-top: 80rpx;
		padding-bottom: 40rpx;
		background-image: linear-gradient(to bottom, #007aff, #0066cc);
		flex-direction: column;
		align-items: center;
		border-bottom-left-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
	}
	
	.avatar-box {
		margin-bottom: 0rpx;
		padding: 6rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.defaultAvatarUrl{
		width: 180rpx;
		height: 180rpx;
		background-color: #0066cc;
		border-radius: 50%;
		justify-content: center;
		align-items: center;
		border: 4rpx solid #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	}
	
	.avatar-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		background-color: #f5f5f5;
		border: 4rpx solid #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	}

	.logo-title {
		flex: 1;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		margin-top: 20rpx;
	}

	.uer-name {
		height: 80rpx;
		line-height: 80rpx;
		font-size: 44rpx;
		color: #FFFFFF;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
	}

	.refresh-btn {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		background-color: rgba(255, 255, 255, 0.2);
		color: #fff;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		flex-direction: row;
		align-items: center;
	}
	
	.refresh-text {
		font-size: 24rpx;
		color: #ffffff;
		margin-left: 6rpx;
	}

	.center-list {
		margin-bottom: 30rpx;
		background-color: #f9f9f9;
	}

	.center-list-cell {
		width: 750rpx;
		background-color: #007AFF;
		height: 40rpx;
	}

	.grid {
		background-color: #FFFFFF;
		margin-bottom: 6px;
	}

	.uni-grid .text {
		font-size: 16px;
		height: 25px;
		line-height: 25px;
		color: #817f82;
	}

	.uni-grid .item ::v-deep .uni-grid-item__box {
		justify-content: center;
		align-items: center;
	}


	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */
	.item-footer {
		flex-direction: row;
		align-items: center;
	}

	.item-footer-text {
		color: #999;
		font-size: 24rpx;
		padding-right: 10rpx;
	}

	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}
</style>
