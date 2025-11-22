import React from 'react';
import { schoolConfig, nextReceiptSerial } from '@/lib/schoolConfig';
import { useSchoolConfig } from '@/hooks/useSchoolConfig';
import { amountToIndianWords } from '@/lib/amountWords';
import { createRoot } from 'react-dom/client';

export interface ReceiptItem {
	label: string;
	amount: number; // 0 if not applied
}

export interface ReceiptProps {
	student: {
		name: string;
		fatherName?: string;
		grade?: string;
		section?: string;
		admissionNumber?: string;
	};
	items: ReceiptItem[]; // expects rows in desired order except total
	paymentDate: string; // YYYY-MM-DD
	serial?: number; // if not provided will auto-generate
	session?: string; // override session
}

// Ensure defined order / fallback labels
const DEFAULT_ORDER = [
	'Admission Fee',
	'Teaching Fee',
	'Exam. Fee',
	'Computer Fee',
	'Development',
	'Other Fee/Late Fee'
];

export const Receipt: React.FC<ReceiptProps> = ({ student, items, paymentDate, serial, session }) => {
	// Load dynamic config (will fallback to defaults until fetched)
	useSchoolConfig();
	const computedSerial = serial ?? nextReceiptSerial();
	// Normalize item list into ordered rows
	const map: Record<string, number> = {};
	items.forEach(i => { map[i.label] = i.amount; });
	const ordered = DEFAULT_ORDER.map(label => ({ label, amount: map[label] ?? 0 }));
	const total = ordered.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
	const amountWords = amountToIndianWords(total);
	const cls = [student.grade ? `Class ${student.grade}` : '', student.section ? `Section ${student.section}` : ''].filter(Boolean).join(' ');
	const sessionValue = session || schoolConfig.session;

	// Two copies (Student & Office) share same data; differentiate by copy label.
	const copies = ['Student Copy', 'Office Copy'];

	return (
		<div className="print-receipt font-serif">
			{copies.map(copy => (
				<div key={copy} className="receipt border border-black p-3 mb-4 break-inside-avoid">
					<div className="text-center mb-2">
						{schoolConfig.logoUrl && (
							<div className="flex flex-col items-center justify-center mb-1">
								<img src={schoolConfig.logoUrl} alt="School Logo" className="h-16 object-contain" />
								<h1 className="text-xl font-bold tracking-wide mt-1">{schoolConfig.name}</h1>
							</div>
						)}
						{!schoolConfig.logoUrl && (
							<h1 className="text-xl font-bold tracking-wide">{schoolConfig.name}</h1>
						)}
						<p className="text-xs italic">{schoolConfig.addressLine}</p>
						<div className="inline-block border px-2 py-0.5 text-sm font-semibold mt-1">Fee Receipt</div>
						<p className="text-[11px] mt-1">{copy}</p>
					</div>
					<div className="text-[11px] leading-4 space-y-0.5 mb-2">
						<div className="flex justify-between"><span>Serial No.: <strong>{String(computedSerial).padStart(4,'0')}</strong></span><span>Date: {paymentDate}</span></div>
						<div>Name of the Student: <strong>{student.name}</strong></div>
						{student.fatherName && <div>Father's Name: <strong>{student.fatherName}</strong></div>}
						<div className="flex justify-between"><span>Class: <strong>{cls || '—'}</strong></span><span>Session: <strong>{sessionValue}</strong></span></div>
						{student.admissionNumber && <div>Admission No.: <strong>{student.admissionNumber}</strong></div>}
					</div>
					<table className="w-full text-[11px] border border-black border-collapse mb-2">
						<thead>
							<tr className="bg-gray-100">
								<th className="border border-black w-10 py-1">S.No.</th>
								<th className="border border-black py-1">Particulars</th>
								<th className="border border-black w-24 py-1">Amount (₹)</th>
							</tr>
						</thead>
						<tbody>
							{ordered.map((row, idx) => (
								<tr key={row.label}>
									<td className="border border-black text-center align-top py-1">{idx + 1}.</td>
									<td className="border border-black px-2 py-1">{row.label}</td>
									<td className="border border-black text-right pr-2 py-1">{row.amount ? row.amount.toFixed(2) : ''}</td>
								</tr>
							))}
							<tr className="font-semibold">
								<td className="border border-black text-center py-1">{ordered.length + 1}.</td>
								<td className="border border-black px-2 py-1">Total Amount</td>
								<td className="border border-black text-right pr-2 py-1">{total.toFixed(2)}</td>
							</tr>
						</tbody>
					</table>
					<div className="text-[11px] mb-6">Amount In Words: <em>{amountWords}</em></div>
					<div className="flex justify-end mt-8">
						<div className="text-center text-[11px]">
							<div className="h-10" />
							<div className="border-t border-black pt-1">Signature</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

// Print helper: opens a new window with receipt HTML and triggers print.
export function printReceipt(props: ReceiptProps & { copies?: number }) {
	// Use iframe approach (most reliable: avoids popup blockers & styling race)
	const iframe = document.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.right = '0';
	iframe.style.bottom = '0';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.border = '0';
	iframe.setAttribute('aria-hidden', 'true');
	document.body.appendChild(iframe);

	const doc = iframe.contentDocument || iframe.contentWindow?.document;
	if (!doc) {
		console.warn('Iframe print document unavailable, fallback inline');
		printReceiptInline(props);
		return;
	}

	// Build a single physical page that already contains both sub-copies (Student & Office)
	const plain = buildPlainHtml({ ...props });
	// Treat props.copies as number of physical pages to duplicate (rarely needed). Default 1.
	const physicalPages = props.copies && props.copies > 0 ? props.copies : 1;
	const repeated = Array.from({ length: physicalPages }).map(() => plain).join('<div style="page-break-after:always"></div>');
	// Use static title for receipt print window
	const html = `<!DOCTYPE html><html><head><title>Receipt</title><style>
@page { size: A4 portrait; margin: 8mm; }
html, body { height: auto; margin: 0; }
.layout { padding: 0; }
.receipt { page-break-inside: avoid; height: 136mm; box-sizing: border-box; margin: 0 0 6mm 0; padding: 6mm; }
table { width:100%; border-collapse:collapse; }
th,td { border:1px solid #000; }
img { max-height:60px; }
</style></head><body><div class="layout">${repeated}</div></body></html>`;

	doc.open();
	doc.write(html);
	doc.close();

	const ensureImagesLoaded = () => {
		const imgs = Array.from(doc.querySelectorAll('img')) as HTMLImageElement[];
		if (imgs.length === 0) return Promise.resolve();
		return Promise.all(imgs.map(img => img.complete ? Promise.resolve(null) : new Promise(res => { img.onload = img.onerror = () => res(null); })));
	};

	ensureImagesLoaded().then(() => {
		iframe.contentWindow?.focus();
		iframe.contentWindow?.print();
		// Cleanup after a delay to allow print dialog
		setTimeout(() => {
			iframe.parentNode?.removeChild(iframe);
		}, 2000);
	});
}

// Build a minimal plain HTML version (no Tailwind dependency) for fallback printing.
function buildPlainHtml(props: ReceiptProps): string {
	const serial = String(props.serial ?? nextReceiptSerial()).padStart(4,'0');
	const sessionValue = props.session || schoolConfig.session;
	const map: Record<string, number> = {};
	props.items.forEach(i => { map[i.label] = i.amount; });
	const ordered = DEFAULT_ORDER.map(label => ({ label, amount: map[label] ?? 0 }));
	const total = ordered.reduce((s, r) => s + r.amount, 0);
	const words = amountToIndianWords(total);
	const cls = [props.student.grade ? `Class ${props.student.grade}` : '', props.student.section ? `Section ${props.student.section}` : ''].filter(Boolean).join(' ');
	const copies = ['Student Copy','Office Copy'];
	const rowsHtml = (copy: string) => `
	<div style="border:1px solid #000;margin:0 0 6mm 0;font-size:11px;font-family:serif;height:136mm;box-sizing:border-box;padding:6mm;">
		<div style="text-align:center;margin-bottom:6px;">
			${schoolConfig.logoUrl ? `<img src="${schoolConfig.logoUrl}" alt="Logo" style="height:60px;object-fit:contain;display:block;margin:0 auto 4px;"/>` : ''}
			<div style="font-size:18px;font-weight:700;letter-spacing:.5px;">${schoolConfig.name}</div>
			<div style="font-size:10px;font-style:italic;">${schoolConfig.addressLine}</div>
			<div style="display:inline-block;border:1px solid #000;padding:2px 6px;font-size:12px;font-weight:600;margin-top:4px;">Fee Receipt</div>
			<div style="font-size:10px;margin-top:4px;">${copy}</div>
		</div>
		<div style="line-height:1.3;margin-bottom:6px;">
			<div style="display:flex;justify-content:space-between;"><span>Serial No.: <strong>${serial}</strong></span><span>Date: ${props.paymentDate}</span></div>
			<div>Name of the Student: <strong>${props.student.name}</strong></div>
			${props.student.fatherName ? `<div>Father's Name: <strong>${props.student.fatherName}</strong></div>` : ''}
			<div style="display:flex;justify-content:space-between;"><span>Class: <strong>${cls || '—'}</strong></span><span>Session: <strong>${sessionValue}</strong></span></div>
			${props.student.admissionNumber ? `<div>Admission No.: <strong>${props.student.admissionNumber}</strong></div>` : ''}
		</div>
		<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:6px;">
			<thead>
				<tr>
					<th style="border:1px solid #000;width:32px;padding:4px;">S.No.</th>
					<th style="border:1px solid #000;padding:4px;">Particulars</th>
					<th style="border:1px solid #000;width:90px;padding:4px;">Amount (₹)</th>
				</tr>
			</thead>
			<tbody>
				${ordered.map((r,i)=>`<tr><td style="border:1px solid #000;text-align:center;padding:4px;">${i+1}.</td><td style="border:1px solid #000;padding:4px;">${r.label}</td><td style="border:1px solid #000;text-align:right;padding:4px;">${r.amount? r.amount.toFixed(2): ''}</td></tr>`).join('')}
				<tr style="font-weight:600;"><td style="border:1px solid #000;text-align:center;padding:4px;">${ordered.length+1}.</td><td style="border:1px solid #000;padding:4px;">Total Amount</td><td style="border:1px solid #000;text-align:right;padding:4px;">${total.toFixed(2)}</td></tr>
			</tbody>
		</table>
		<div style="font-size:11px;margin-bottom:30px;">Amount In Words: <em>${words}</em></div>
		<div style="text-align:right;font-size:11px;margin-top:20px;">
			<div style="height:40px;"></div>
			<div style="border-top:1px solid #000;padding-top:4px;display:inline-block;">Signature</div>
		</div>
	</div>`;
	return copies.map(rowsHtml).join('');
}

// Inline print alternative: inject hidden container into current document and print.
export function printReceiptInline(props: ReceiptProps & { copies?: number }) {
	const id = 'inline-print-receipt-container';
	let host = document.getElementById(id);
	if (!host) {
		host = document.createElement('div');
		host.id = id;
		host.style.position = 'fixed';
		host.style.left = '-9999px'; // hide off-screen
		host.style.top = '0';
		host.style.width = '210mm';
		host.style.zIndex = '0';
		document.body.appendChild(host);
		// Add print styles once
		const style = document.createElement('style');
		style.textContent = `@page { size: A4 portrait; margin: 8mm; }\n#${id} .receipt { page-break-inside: avoid; }`;
		document.head.appendChild(style);
	}
	const physicalPages = props.copies && props.copies > 0 ? props.copies : 1;
	const plain = buildPlainHtml(props);
	host.innerHTML = Array.from({ length: physicalPages }).map(()=> plain).join('');
	// Keep original document title unchanged (static receipt naming reverted)
	// Attempt React enhancement (optional)
	try {
		const reactWrapper = document.createElement('div');
		host.appendChild(reactWrapper);
		createRoot(reactWrapper).render(<Receipt {...props} />);
	} catch {}
	setTimeout(() => window.print(), 200); // slight delay for layout
}

export default Receipt;

