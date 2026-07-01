import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface PendingProfile {
  id: string;
  display_name: string;
  suburb: string;
  created_at: string;
  idUrl: string | null;
  selfieUrl: string | null;
}

interface OpenReport {
  id: string;
  reason: string;
  created_at: string;
  reporter_id: string;
  listing_id: string | null;
  user_id: string | null;
}

async function getSignedUrlsForProfile(profileId: string) {
  const { data: files } = await supabaseAdmin.storage
    .from('verifications')
    .list(profileId);

  const idFile = files?.find((f) => f.name.startsWith('id.'));
  const selfieFile = files?.find((f) => f.name.startsWith('selfie.'));

  const idUrl = idFile
    ? (
        await supabaseAdmin.storage
          .from('verifications')
          .createSignedUrl(`${profileId}/${idFile.name}`, 60 * 60)
      ).data?.signedUrl ?? null
    : null;

  const selfieUrl = selfieFile
    ? (
        await supabaseAdmin.storage
          .from('verifications')
          .createSignedUrl(`${profileId}/${selfieFile.name}`, 60 * 60)
      ).data?.signedUrl ?? null
    : null;

  return { idUrl, selfieUrl };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session || session.value !== 'authenticated') {
    redirect('/admin/login');
  }

  const [
    { data: pendingProfilesRaw },
    { data: openReportsRaw },
    { count: activeListingsCount },
    { count: verifiedProfilesCount },
    { count: openReportsCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, display_name, suburb, created_at')
      .eq('verification_status', 'pending'),
    supabaseAdmin
      .from('reports')
      .select('id, reason, created_at, reporter_id, listing_id, user_id')
      .eq('status', 'open'),
    supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'verified'),
    supabaseAdmin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ]);

  const pendingProfiles: PendingProfile[] = await Promise.all(
    (pendingProfilesRaw ?? []).map(async (profile) => {
      const { idUrl, selfieUrl } = await getSignedUrlsForProfile(profile.id);
      return { ...profile, idUrl, selfieUrl };
    })
  );

  const reports: OpenReport[] = openReportsRaw ?? [];

  return (
    <div className="min-h-screen bg-[#F3F8F8] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          Admin
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[#C4D8D8] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5F5E5A]">
              Active listings
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">
              {activeListingsCount ?? 0}
            </p>
          </div>
          <div className="rounded-[20px] border border-[#C4D8D8] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5F5E5A]">
              Verified users
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">
              {verifiedProfilesCount ?? 0}
            </p>
          </div>
          <div className="rounded-[20px] border border-[#C4D8D8] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#5F5E5A]">
              Open reports
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#2C2C2A]">
              {openReportsCount ?? 0}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold tracking-tight text-[#2C2C2A]">
            Pending verifications
          </h2>

          {pendingProfiles.length === 0 ? (
            <p className="mt-4 text-sm text-[#5F5E5A]">Nothing pending.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {pendingProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-[20px] border border-[#C4D8D8] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#2C2C2A]">
                        {profile.display_name}
                      </p>
                      <p className="text-xs text-[#5F5E5A]">
                        {profile.suburb} · Submitted{' '}
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-3 text-xs font-semibold">
                      {profile.idUrl ? (
                        <a
                          href={profile.idUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2C2C2A] underline"
                        >
                          View ID
                        </a>
                      ) : (
                        <span className="text-[#5F5E5A]">No ID uploaded</span>
                      )}
                      {profile.selfieUrl ? (
                        <a
                          href={profile.selfieUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2C2C2A] underline"
                        >
                          View selfie
                        </a>
                      ) : (
                        <span className="text-[#5F5E5A]">No selfie uploaded</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="profile_id" value={profile.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button
                        type="submit"
                        className="rounded-[13px] bg-[#2C2C2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a1a18]"
                      >
                        Approve
                      </button>
                    </form>
                    <form action="/api/admin/verify" method="POST">
                      <input type="hidden" name="profile_id" value={profile.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="rounded-[13px] border border-[#C4D8D8] px-4 py-2 text-xs font-bold text-[#2C2C2A] hover:bg-[#F3F8F8]"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold tracking-tight text-[#2C2C2A]">
            Open reports
          </h2>

          {reports.length === 0 ? (
            <p className="mt-4 text-sm text-[#5F5E5A]">No open reports.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[20px] border border-[#C4D8D8] bg-white p-5"
                >
                  <p className="text-sm font-bold text-[#2C2C2A]">{report.reason}</p>
                  <p className="mt-1 text-xs text-[#5F5E5A]">
                    Reported {new Date(report.created_at).toLocaleDateString()}
                    {' · '}
                    Reporter: {report.reporter_id}
                    {report.listing_id && ` · Listing: ${report.listing_id}`}
                    {report.user_id && ` · User: ${report.user_id}`}
                  </p>

                  <form action="/api/admin/reports" method="POST" className="mt-4">
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="action" value="reviewed" />
                    <button
                      type="submit"
                      className="rounded-[13px] bg-[#2C2C2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a1a18]"
                    >
                      Mark as reviewed
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
