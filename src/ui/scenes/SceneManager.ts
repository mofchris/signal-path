/**
 * Scene Manager
 *
 * Manages scene lifecycle and transitions.
 * Delegates update, render, and input to the current active scene.
 *
 * Usage:
 * ```typescript
 * const manager = new SceneManager();
 * manager.register('menu', new MenuScene());
 * manager.register('game', new GameScene());
 * manager.switchTo('menu', context);
 * ```
 */

import type { Scene, SceneName, SceneContext } from './types';

export class SceneManager {
  private scenes: Map<SceneName, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneName: SceneName | null = null;
  private context: SceneContext | null = null;

  /** Extra data passed between scenes (e.g. selected level index, game result) */
  private sceneData: Record<string, unknown> = {};

  /**
   * Register a scene by name.
   */
  register(name: SceneName, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  /**
   * Set the shared context. Called once during initialization.
   */
  setContext(context: SceneContext): void {
    this.context = context;
  }

  /**
   * Switch to a named scene.
   * Calls exit() on current scene and enter() on next scene.
   */
  switchTo(name: SceneName, data?: Record<string, unknown>): void {
    if (!this.context) {
      throw new Error('SceneManager: context not set. Call setContext() first.');
    }

    const nextScene = this.scenes.get(name);
    if (!nextScene) {
      throw new Error(`SceneManager: scene "${name}" not registered.`);
    }

    // Store scene data for the next scene to read
    if (data) {
      this.sceneData = { ...this.sceneData, ...data };
    }

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.exit();
    }

    // Enter next scene
    this.currentScene = nextScene;
    this.currentSceneName = name;
    this.currentScene.enter(this.context);
  }

  /**
   * Get data passed between scenes.
   */
  getData<T>(key: string): T | undefined {
    return this.sceneData[key] as T | undefined;
  }

  /**
   * Set data for inter-scene communication.
   */
  setData(key: string, value: unknown): void {
    this.sceneData[key] = value;
  }

  /**
   * Get the name of the current active scene.
   */
  getCurrentSceneName(): SceneName | null {
    return this.currentSceneName;
  }

  /**
   * Delegate update to current scene.
   */
  update(dt: number): void {
    this.currentScene?.update(dt);
  }

  /**
   * Delegate render to current scene.
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.currentScene?.render(ctx);
  }

  /**
   * Delegate input to current scene.
   */
  handleInput(key: string, event: KeyboardEvent): void {
    this.currentScene?.handleInput(key, event);
  }
}
