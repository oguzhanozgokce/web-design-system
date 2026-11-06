'use client';

import { useCallback, useEffect, useState } from 'react';

export type CopyValue = string | (() => string | Promise<string>);

export type CopySource = string | Promise<string>;

export type CopyStatus = 'idle' | 'copied' | 'failed';

export interface UseCopyToClipboardOptions {
  timeout?: number;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
}

export function resolveCopyValue(value: CopyValue | CopySource): CopySource {
  if (typeof value !== 'function') return value;
  try {
    return value();
  } catch (error) {
    return Promise.reject(error);
  }
}

function textBlob(text: string) {
  return new Blob([text], { type: 'text/plain' });
}

function ignoreRejection() {}

async function writeClipboardItem(clipboard: Clipboard, source: Promise<string>) {
  if (typeof ClipboardItem === 'undefined' || typeof clipboard.write !== 'function') return false;
  const blob = source.then(textBlob);
  blob.catch(ignoreRejection);
  try {
    await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function writeToClipboard(source: CopySource): Promise<string> {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (!clipboard) throw new Error('The Clipboard API is not available in this context.');

  if (typeof source === 'string') {
    await clipboard.writeText(source);
    return source;
  }

  if (await writeClipboardItem(clipboard, source)) return source;

  const text = await source;
  await clipboard.writeText(text);
  return text;
}

interface CopyState {
  status: CopyStatus;
  attempt: number;
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
  onCopyError,
}: UseCopyToClipboardOptions = {}) {
  const [state, setState] = useState<CopyState>({ status: 'idle', attempt: 0 });

  useEffect(() => {
    if (state.status === 'idle' || !Number.isFinite(timeout)) return;
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, status: 'idle' })),
      timeout,
    );
    return () => window.clearTimeout(timer);
  }, [state, timeout]);

  const copy = useCallback(
    async (value: CopyValue | CopySource) => {
      let text: string;
      try {
        text = await writeToClipboard(resolveCopyValue(value));
      } catch (error) {
        setState((current) => ({ status: 'failed', attempt: current.attempt + 1 }));
        onCopyError?.(error);
        return false;
      }
      setState((current) => ({ status: 'copied', attempt: current.attempt + 1 }));
      onCopy?.(text);
      return true;
    },
    [onCopy, onCopyError],
  );

  const reset = useCallback(() => setState((current) => ({ ...current, status: 'idle' })), []);

  return { status: state.status, attempt: state.attempt, copy, reset };
}
