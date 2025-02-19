import { Framework, MobileProject, MobileProjectConfig } from '@trapezedev/project';
import { AssetKind, Assets } from './definitions';
import { join } from 'path';
import { pathExists } from '@ionic/utils-fs';
import { InputAsset } from './input-asset';
import { error } from './util/log';

export class Project extends MobileProject {
  assets: Assets | null = null;
  directory: string | null = null;

  assetDir: string;

  constructor(projectRoot: string = process.cwd(), config: MobileProjectConfig, private assetPath: string = 'assets') {
    super(projectRoot, config);

    this.directory = projectRoot;
    this.assetDir = join(projectRoot, assetPath);

    this.detectAssetDir();
  }

  async detectAssetDir() {
    if (this.assetPath === 'assets' && !(await pathExists(this.assetDir))) {
      this.assetDir = join(this.projectRoot, 'resources');
    }
  }

  async androidExists() {
    return this.config.android?.path && (await pathExists(this.config.android?.path));
  }

  async iosExists() {
    return this.config.ios?.path && (await pathExists(this.config.ios?.path));
  }

  async assetDirExists() {
    return pathExists(this.assetDir);
  }

  assetDirectory() {
    return this.assetDir;
  }

  async loadInputAssets(): Promise<Assets> {
    this.assets = {
      logo: await this.loadLogoInputAsset(),
      logoDark: await this.loadInputAsset('logo-dark', AssetKind.LogoDark),
      icon: await this.loadInputAsset('icon-only', AssetKind.Icon),
      iconForeground: await this.loadInputAsset('icon-foreground', AssetKind.IconForeground),
      iconBackground: await this.loadInputAsset('icon-background', AssetKind.IconBackground),
      splash: await this.loadInputAsset('splash', AssetKind.Splash),
      splashDark: await this.loadInputAsset('splash-dark', AssetKind.SplashDark),

      iosIcon: await this.loadInputAsset('ios/icon', AssetKind.Icon),
      iosSplash: await this.loadInputAsset('ios/splash', AssetKind.Splash),
      iosSplashDark: await this.loadInputAsset('ios/splash-dark', AssetKind.SplashDark),
      iosNotificationIcon: await this.loadInputAsset('ios/notification-icon', AssetKind.NotificationIcon),
      iosSettingsIcon: await this.loadInputAsset('ios/settings-icon', AssetKind.SettingsIcon),
      iosSpotlightIcon: await this.loadInputAsset('ios/spotlight-icon', AssetKind.SpotlightIcon),

      androidIcon: await this.loadInputAsset('android/icon', AssetKind.Icon),
      androidIconForeground: await this.loadInputAsset('android/icon-foreground', AssetKind.Icon),
      androidIconBackground: await this.loadInputAsset('android/icon-background', AssetKind.Icon),

      androidSplash: await this.loadInputAsset('android/splash', AssetKind.Splash),
      androidSplashDark: await this.loadInputAsset('android/splash-dark', AssetKind.SplashDark),
      androidNotificationIcon: await this.loadInputAsset('android/notification', AssetKind.NotificationIcon),
    };
    return this.assets;
  }

  private async loadLogoInputAsset() {
    let logo = await this.loadInputAsset('logo', AssetKind.Logo);
    if (!logo) {
      logo = await this.loadInputAsset('icon', AssetKind.Logo);
    }
    return logo;
  }

  private async loadInputAsset(path: string, kind: AssetKind) {
    let imagePath: string | null = null;

    const extensions = ['.png', '.webp', '.jpg', '.jpeg', '.svg'];
    let filename: string | null = null;
    for (let ext of extensions) {
      filename = `${path}${ext}`;
      if (await pathExists(join(this.assetDir, filename))) {
        imagePath = join(this.assetDir, filename);
        break;
      }
    }

    if (!imagePath) {
      return null;
    }

    const asset = new InputAsset(imagePath, kind);

    try {
      await asset.load();
      return asset;
    } catch (e) {
      error(`Unable to load source image ${filename}: ${(e as any).message}`);
      return null;
    }
  }
}
