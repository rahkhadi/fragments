const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  // deleteFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/aws');

const crypto = require('crypto');

const ownerId = 'user1@email.com';
const id = crypto.randomUUID(); // random unique ID
const testBuffer = Buffer.from('Hello, S3!');

describe('AWS S3 fragment data model', () => {
  it('should write and read fragment metadata', async () => {
    const metadata = { id, ownerId, type: 'text/plain' };
    await writeFragment(metadata);
    const result = await readFragment(ownerId, id);
    expect(result).toEqual(metadata);
  });

  it('should write and read raw fragment data to S3', async () => {
    await writeFragmentData(ownerId, id, testBuffer);
    const result = await readFragmentData(ownerId, id);
    expect(result.toString()).toBe('Hello, S3!');
  });

  it('should list fragments', async () => {
    const list = await listFragments(ownerId, true);
    expect(Array.isArray(list)).toBe(true);
    expect(list.find((f) => f.id === id)).toBeDefined();
  });

  it('should delete fragment data from S3 and memory', async () => {
    await deleteFragment(ownerId, id);
    await expect(readFragment(ownerId, id)).resolves.toBeUndefined();
    await expect(readFragmentData(ownerId, id)).rejects.toThrow();
  });
});
