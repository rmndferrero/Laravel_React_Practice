<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContactController extends Controller
{
    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Contact::where('user_id', Auth::id())
            ->search($request->input('search'))
            ->filterByCompany($request->input('company'))
            ->filterByCountry($request->input('country'));

        // Sorting
        $sortField     = $request->input('sort', 'last_name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSorts = ['first_name', 'last_name', 'email', 'company', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection === 'desc' ? 'desc' : 'asc');
        }

        $contacts = $query
            ->paginate($request->input('per_page', 15))
            ->withQueryString()
            ->through(fn ($c) => $this->formatContact($c));

        // Filter options (distinct values belonging to this user)
        $companies = Contact::where('user_id', Auth::id())
            ->whereNotNull('company')
            ->distinct()
            ->orderBy('company')
            ->pluck('company');

        $countries = Contact::where('user_id', Auth::id())
            ->whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('Contacts/Index', [
            'contacts'  => $contacts,
            'filters'   => $request->only(['search', 'company', 'country', 'sort', 'direction']),
            'companies' => $companies,
            'countries' => $countries,
        ]);
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public function create()
    {
        return Inertia::render('Contacts/Create');
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $data = $this->validateContact($request);
        $data['user_id'] = Auth::id();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        Contact::create($data);

        return redirect()->route('contacts.index')
            ->with('success', 'Contact created successfully.');
    }

    // ─── Edit ─────────────────────────────────────────────────────────────────

    public function edit(Contact $contact)
    {
        $this->authorizeContact($contact);

        return Inertia::render('Contacts/Create', [
            'contact' => $this->formatContact($contact),
        ]);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function update(Request $request, Contact $contact)
    {
        $this->authorizeContact($contact);

        $data = $this->validateContact($request, $contact->id);

        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($contact->avatar) {
                Storage::disk('public')->delete($contact->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Allow explicit avatar removal
        elseif ($request->input('remove_avatar')) {
            if ($contact->avatar) {
                Storage::disk('public')->delete($contact->avatar);
            }
            $data['avatar'] = null;
        }

        else {
            // If no new file was uploaded and we aren't removing it, 
            // unset the avatar key so we don't accidentally overwrite the DB record with null.
            unset($data['avatar']);
        }

        $contact->update($data);

        return redirect()->route('contacts.index')
            ->with('success', 'Contact updated successfully.');
    }

    // ─── Destroy (single) ─────────────────────────────────────────────────────

    public function destroy(Contact $contact)
    {
        $this->authorizeContact($contact);

        if ($contact->avatar) {
            Storage::disk('public')->delete($contact->avatar);
        }

        $contact->delete();

        return redirect()->route('contacts.index')
            ->with('success', 'Contact deleted.');
    }

    // ─── Bulk Destroy ─────────────────────────────────────────────────────────

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $contacts = Contact::where('user_id', Auth::id())
            ->whereIn('id', $request->ids)
            ->get();

        foreach ($contacts as $contact) {
            if ($contact->avatar) {
                Storage::disk('public')->delete($contact->avatar);
            }
            $contact->delete();
        }

        return redirect()->route('contacts.index')
            ->with('success', count($contacts) . ' contact(s) deleted.');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function validateContact(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['nullable', 'email', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:50'],
            'company'    => ['nullable', 'string', 'max:150'],
            'street'     => ['nullable', 'string', 'max:255'],
            'city'       => ['nullable', 'string', 'max:100'],
            'state'      => ['nullable', 'string', 'max:100'],
            'zip'        => ['nullable', 'string', 'max:20'],
            'country'    => ['nullable', 'string', 'max:100'],
            'notes'      => ['nullable', 'string', 'max:2000'],
            'tags'       => ['nullable', 'string', 'max:500'],
            'avatar'     => ['nullable', 'image', 'max:2048'], // 2 MB
        ]);
    }

    private function formatContact(Contact $contact): array
    {
        return [
            'id'         => $contact->id,
            'first_name' => $contact->first_name,
            'last_name'  => $contact->last_name,
            'full_name'  => $contact->full_name,
            'email'      => $contact->email,
            'phone'      => $contact->phone,
            'company'    => $contact->company,
            'street'     => $contact->street,
            'city'       => $contact->city,
            'state'      => $contact->state,
            'zip'        => $contact->zip,
            'country'    => $contact->country,
            'notes'      => $contact->notes,
            'tags'       => $contact->tags,
            'tags_array' => $contact->tags_array,
            'avatar_url' => $contact->avatar_url,
            'created_at' => $contact->created_at->toDateString(),
        ];
    }

    private function authorizeContact(Contact $contact): void
    {
        if ($contact->user_id !== Auth::id()) {
            abort(403);
        }
    }
}