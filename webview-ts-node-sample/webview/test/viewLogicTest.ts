import { expect } from 'chai';
import { increment } from '../src/versionManagement';

describe("#versionManagement()", () => {
	describe("#increment()", () => {
		it('simple assertion should pass', () => {
			expect(true).to.be.equal(true);
		});

		it('increments patch', () => {
			const actual = increment("1.0.0", "patch");
			expect(actual).to.be.equal("1.0.1");
		});

		it('increments minor', () => {
			const actual = increment("1.0.1", "minor");
			expect(actual).to.be.equal("1.1.0");
		});

		it('increments major', () => {
			const actual = increment("1.1.1", "major");
			expect(actual).to.be.equal("2.0.0");
		});
	});
});