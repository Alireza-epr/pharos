import { Response } from 'express';
import { ProgressStream } from '../src/helpers/utils/progressStream';
import { EQueryStepId, EQuerySkipReason, EQueryStepStatus } from '@packages/enum';

// A minimal stand-in for Express's Response: just enough surface for
// ProgressStream (writeHead/write/on/end, plus the writableEnded/destroyed
// flags it checks before writing) with every write captured so tests can
// assert on the exact NDJSON lines produced.
const fakeResponse = () => {
  const writes: string[] = [];
  const res = {
    writeHead: jest.fn(),
    write: jest.fn((chunk: string) => {
      writes.push(chunk);
      return true;
    }),
    on: jest.fn(),
    end: jest.fn(),
    writableEnded: false,
    destroyed: false,
  } as unknown as Response;
  return { res, writes };
};

const parsedLines = (a_Writes: string[]) =>
  a_Writes.map((line) => JSON.parse(line.trimEnd()));

describe('ProgressStream', () => {
  it('commits_200_with_ndjson_content_type_on_construction', () => {
    const { res } = fakeResponse();
    new ProgressStream(res);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    });
  });

  it('writes_one_newline_terminated_json_line_per_call', () => {
    const { res, writes } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.running(EQueryStepId.validate);
    stream.success(EQueryStepId.validate);

    expect(writes).toHaveLength(2);
    for (const line of writes) expect(line.endsWith('\n')).toBe(true);
  });

  it('running_then_success_carries_the_given_meta', () => {
    const { res, writes } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.running(EQueryStepId.filterScope);
    stream.success(EQueryStepId.filterScope, { valid: 42, total: 100 });

    const [running, success] = parsedLines(writes);
    expect(running).toEqual({
      type: 'step',
      id: EQueryStepId.filterScope,
      status: EQueryStepStatus.running,
    });
    expect(success).toEqual({
      type: 'step',
      id: EQueryStepId.filterScope,
      status: EQueryStepStatus.success,
      meta: { valid: 42, total: 100 },
    });
  });

  it('skipped_carries_the_given_reason', () => {
    const { writes, res } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.skipped(EQueryStepId.writeCache, EQuerySkipReason.cacheDisabled);

    expect(parsedLines(writes)[0]).toEqual({
      type: 'step',
      id: EQueryStepId.writeCache,
      status: EQueryStepStatus.skipped,
      reason: EQuerySkipReason.cacheDisabled,
    });
  });

  it('error_current_attributes_the_failure_to_the_last_started_step', () => {
    const { writes, res } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.running(EQueryStepId.hotspots);
    stream.errorCurrent('boom');

    expect(parsedLines(writes)[1]).toEqual({
      type: 'step',
      id: EQueryStepId.hotspots,
      status: EQueryStepStatus.error,
      error: 'boom',
    });
  });

  it('error_current_is_a_noop_before_any_step_has_started', () => {
    const { writes, res } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.errorCurrent('boom');

    expect(writes).toHaveLength(0);
  });

  it('result_writes_the_payload_and_ends_the_response', () => {
    const { writes, res } = fakeResponse();
    const stream = new ProgressStream(res);

    stream.result({ success: true, entries: [] });

    expect(parsedLines(writes)[0]).toEqual({
      type: 'result',
      payload: { success: true, entries: [] },
    });
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('registers_an_error_listener_so_a_late_write_failure_cannot_crash_the_process', () => {
    const { res } = fakeResponse();
    new ProgressStream(res);

    expect(res.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  // The client (e.g. closing the progress modal early) can disconnect
  // mid-request; writes after that must be no-ops instead of throwing on a
  // dead socket.
  it('does_not_write_once_the_response_has_already_ended', () => {
    const { res, writes } = fakeResponse();
    const stream = new ProgressStream(res);
    (res as unknown as { writableEnded: boolean }).writableEnded = true;

    stream.running(EQueryStepId.validate);
    stream.result({ success: false, error: ['x'] });

    expect(writes).toHaveLength(0);
    expect(res.end).not.toHaveBeenCalled();
  });

  it('does_not_write_once_the_response_is_destroyed', () => {
    const { res, writes } = fakeResponse();
    const stream = new ProgressStream(res);
    (res as unknown as { destroyed: boolean }).destroyed = true;

    stream.running(EQueryStepId.validate);
    stream.result({ success: false, error: ['x'] });

    expect(writes).toHaveLength(0);
    expect(res.end).not.toHaveBeenCalled();
  });
});
